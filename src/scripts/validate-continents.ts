/**
 * Script to validate continents data quality
 * Run with: npx ts-node scripts/validate-continents.ts
 */

import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

const readFile = promisify(fs.readFile)

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    fileSize: number
    featureCount: number
    polygonCount: number
    multiPolygonCount: number
    totalCoordinates: number
    boundingBox: [number, number, number, number]
  }
}

async function validateContinentsData(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      fileSize: 0,
      featureCount: 0,
      polygonCount: 0,
      multiPolygonCount: 0,
      totalCoordinates: 0,
      boundingBox: [180, 90, -180, -90], // [minLon, minLat, maxLon, maxLat]
    },
  }

  try {
    // Read the continents data file
    const filePath = path.join(process.cwd(), "src", "assets", "data", "continents.geojson")

    if (!fs.existsSync(filePath)) {
      result.errors.push("Continents data file not found: " + filePath)
      result.isValid = false
      return result
    }

    const fileContent = await readFile(filePath, "utf-8")
    result.stats.fileSize = fileContent.length

    // Parse JSON
    let geojson: any
    try {
      geojson = JSON.parse(fileContent)
    } catch (error) {
      // @ts-ignore
      result.errors.push("Invalid JSON format: " + error.message)
      result.isValid = false
      return result
    }

    // Validate GeoJSON structure
    if (!geojson.type || geojson.type !== "FeatureCollection") {
      result.errors.push("Root object must be a FeatureCollection")
      result.isValid = false
    }

    if (!Array.isArray(geojson.features)) {
      result.errors.push("Features property must be an array")
      result.isValid = false
      return result
    }

    result.stats.featureCount = geojson.features.length

    if (result.stats.featureCount === 0) {
      result.errors.push("No features found in the data")
      result.isValid = false
      return result
    }

    // Validate each feature
    let totalCoordinates = 0
    const minLon = 180,
      minLat = 90,
      maxLon = -180,
      maxLat = -90

    for (let i = 0; i < geojson.features.length; i++) {
      const feature = geojson.features[i]
      const featurePrefix = `Feature ${i + 1}`

      // Check feature structure
      if (!feature.type || feature.type !== "Feature") {
        result.errors.push(`${featurePrefix}: Must be a Feature`)
        continue
      }

      if (!feature.geometry) {
        result.errors.push(`${featurePrefix}: Missing geometry`)
        continue
      }

      if (!feature.properties) {
        result.warnings.push(`${featurePrefix}: Missing properties`)
      }

      // Check geometry
      const geometry = feature.geometry
      if (!geometry.type) {
        result.errors.push(`${featurePrefix}: Geometry missing type`)
        continue
      }

      if (!geometry.coordinates) {
        result.errors.push(`${featurePrefix}: Geometry missing coordinates`)
        continue
      }

      // Count geometry types
      if (geometry.type === "Polygon") {
        result.stats.polygonCount++
        totalCoordinates += countPolygonCoordinates(geometry.coordinates)
        updateBoundingBox(geometry.coordinates, { minLon, minLat, maxLon, maxLat })
      } else if (geometry.type === "MultiPolygon") {
        result.stats.multiPolygonCount++
        for (const polygon of geometry.coordinates) {
          totalCoordinates += countPolygonCoordinates(polygon)
          updateBoundingBox(polygon, { minLon, minLat, maxLon, maxLat })
        }
      } else {
        result.warnings.push(`${featurePrefix}: Unexpected geometry type: ${geometry.type}`)
      }

      // Validate coordinates
      try {
        validateCoordinates(geometry.coordinates, geometry.type)
      } catch (error) {
        // @ts-ignore
        result.errors.push(`${featurePrefix}: Invalid coordinates - ${error.message}`)
      }
    }

    result.stats.totalCoordinates = totalCoordinates
    result.stats.boundingBox = [minLon, minLat, maxLon, maxLat]

    // Performance warnings
    if (result.stats.fileSize > 5 * 1024 * 1024) {
      // 5MB
      result.warnings.push("File size is quite large (>5MB), may impact performance")
    }

    if (result.stats.totalCoordinates > 100000) {
      result.warnings.push("High coordinate count may impact performance")
    }

    // Coverage validation
    const [minLon2, minLat2, maxLon2, maxLat2] = result.stats.boundingBox
    if (minLon2 > -170 || maxLon2 < 170 || minLat2 > -80 || maxLat2 < 80) {
      result.warnings.push("Data may not have global coverage")
    }

    // Final validation
    if (result.errors.length > 0) {
      result.isValid = false
    }

    return result
  } catch (error) {
    // @ts-ignore
    result.errors.push(`Validation failed: ${error.message}`)
    result.isValid = false
    return result
  }
}

function countPolygonCoordinates(coordinates: any[]): number {
  let count = 0
  for (const ring of coordinates) {
    if (Array.isArray(ring)) {
      count += ring.length
    }
  }
  return count
}

function updateBoundingBox(coordinates: any[], bbox: any): void {
  function processRing(ring: any[]) {
    for (const coord of ring) {
      if (Array.isArray(coord) && coord.length >= 2) {
        const [lon, lat] = coord
        if (typeof lon === "number" && typeof lat === "number") {
          bbox.minLon = Math.min(bbox.minLon, lon)
          bbox.maxLon = Math.max(bbox.maxLon, lon)
          bbox.minLat = Math.min(bbox.minLat, lat)
          bbox.maxLat = Math.max(bbox.maxLat, lat)
        }
      }
    }
  }

  for (const ring of coordinates) {
    if (Array.isArray(ring)) {
      processRing(ring)
    }
  }
}

function validateCoordinates(coordinates: any, geometryType: string): void {
  if (!Array.isArray(coordinates)) {
    throw new Error("Coordinates must be an array")
  }

  function validateCoordPair(coord: any): void {
    if (!Array.isArray(coord) || coord.length < 2) {
      throw new Error("Coordinate must be [longitude, latitude] array")
    }

    const [lon, lat] = coord
    if (typeof lon !== "number" || typeof lat !== "number") {
      throw new Error("Longitude and latitude must be numbers")
    }

    if (lon < -180 || lon > 180) {
      throw new Error(`Invalid longitude: ${lon}`)
    }

    if (lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude: ${lat}`)
    }
  }

  function validateRing(ring: any): void {
    if (!Array.isArray(ring) || ring.length < 4) {
      throw new Error("Polygon ring must have at least 4 coordinates")
    }

    for (const coord of ring) {
      validateCoordPair(coord)
    }

    // Check if ring is closed
    const first = ring[0]
    const last = ring[ring.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
      throw new Error("Polygon ring must be closed (first and last coordinates must be the same)")
    }
  }

  if (geometryType === "Polygon") {
    for (const ring of coordinates) {
      validateRing(ring)
    }
  } else if (geometryType === "MultiPolygon") {
    for (const polygon of coordinates) {
      for (const ring of polygon) {
        validateRing(ring)
      }
    }
  }
}

async function main(): Promise<void> {
  console.log("🔍 Maritime Routing - Continents Data Validator")
  console.log("=".repeat(50))

  try {
    const result = await validateContinentsData()

    // Display results
    console.log("\n📊 Validation Results:")
    console.log(`Status: ${result.isValid ? "✅ VALID" : "❌ INVALID"}`)

    console.log("\n📈 Statistics:")
    console.log(`File size: ${(result.stats.fileSize / 1024).toFixed(1)} KB`)
    console.log(`Features: ${result.stats.featureCount}`)
    console.log(`Polygons: ${result.stats.polygonCount}`)
    console.log(`MultiPolygons: ${result.stats.multiPolygonCount}`)
    console.log(`Total coordinates: ${result.stats.totalCoordinates.toLocaleString()}`)
    console.log(`Bounding box: [${result.stats.boundingBox.map((n) => n.toFixed(2)).join(", ")}]`)

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:")
      result.errors.forEach((error) => console.log(`  • ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log("\n⚠️  Warnings:")
      result.warnings.forEach((warning) => console.log(`  • ${warning}`))
    }

    if (result.isValid) {
      console.log("\n🎉 Data validation passed!")
      console.log("\nRecommendations:")
      console.log("• Test maritime routing with various port combinations")
      console.log("• Verify that routes properly avoid land masses")
      console.log("• Monitor application performance with this data size")

      if (result.stats.fileSize > 1024 * 1024) {
        // 1MB
        console.log("• Consider using lower resolution data if performance is an issue")
      }
    } else {
      console.log("\n💥 Data validation failed!")
      console.log("\nNext steps:")
      console.log("• Fix the errors listed above")
      console.log("• Re-run the update script: npm run update-continents")
      console.log("• Try a different data source or resolution")
    }
  } catch (error) {
    // @ts-ignore
    console.error("\n💥 Validation script failed:", error.message)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { validateContinentsData }
