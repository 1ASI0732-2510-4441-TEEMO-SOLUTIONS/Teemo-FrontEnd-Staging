/**
 * Script to download and update continents data from Natural Earth
 * Run with: npx ts-node scripts/update-continents-data.ts
 */

import * as fs from "fs"
import * as path from "path"
import * as https from "https"
import { promisify } from "util"

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

interface DownloadSource {
  name: string
  url: string
  description: string
  resolution: "low" | "medium" | "high"
}

const DOWNLOAD_SOURCES: DownloadSource[] = [
  {
    name: "natural-earth-land-50m",
    url: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    description: "Natural Earth Land (Medium Resolution)",
    resolution: "medium",
  },
  {
    name: "natural-earth-countries-110m",
    url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
    description: "Natural Earth Countries (Low Resolution)",
    resolution: "low",
  },
  {
    name: "natural-earth-countries-50m",
    url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
    description: "Natural Earth Countries (Medium Resolution)",
    resolution: "medium",
  },
]

async function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
          return
        }

        let data = ""
        response.on("data", (chunk) => {
          data += chunk
        })

        response.on("end", () => {
          resolve(data)
        })
      })
      .on("error", (error) => {
        reject(error)
      })
  })
}

async function processGeoJSON(data: string): Promise<any> {
  try {
    const geojson = JSON.parse(data)

    // Validate GeoJSON structure
    if (!geojson.type || geojson.type !== "FeatureCollection") {
      throw new Error("Invalid GeoJSON: not a FeatureCollection")
    }

    if (!Array.isArray(geojson.features)) {
      throw new Error("Invalid GeoJSON: features is not an array")
    }

    // Filter and clean features
    const cleanedFeatures = geojson.features
      .filter((feature: any) => {
        // Keep only land features
        return feature.geometry && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon")
      })
      .map((feature: any) => {
        // Clean up properties
        return {
          type: "Feature",
          properties: {
            name: feature.properties?.NAME || feature.properties?.name || "Unknown",
            continent: feature.properties?.CONTINENT || feature.properties?.continent,
            region: feature.properties?.REGION_UN || feature.properties?.region,
            subregion: feature.properties?.SUBREGION || feature.properties?.subregion,
          },
          geometry: feature.geometry,
        }
      })

    return {
      type: "FeatureCollection",
      features: cleanedFeatures,
      metadata: {
        generated: new Date().toISOString(),
        featureCount: cleanedFeatures.length,
        source: "Natural Earth",
        description: "Processed continents and countries data for maritime routing",
      },
    }
  } catch (error) {
    // @ts-ignore
    throw new Error(`Failed to process GeoJSON: ${error.message}`)
  }
}

async function updateContinentsData(source: DownloadSource): Promise<void> {
  console.log(`Downloading ${source.description}...`)

  try {
    // Download the data
    const rawData = await downloadFile(source.url)
    console.log(`Downloaded ${rawData.length} bytes`)

    // Process the GeoJSON
    const processedData = await processGeoJSON(rawData)
    console.log(`Processed ${processedData.features.length} features`)

    // Ensure assets/data directory exists
    const assetsDir = path.join(process.cwd(), "src", "assets", "data")
    await mkdir(assetsDir, { recursive: true })

    // Write the processed data
    const outputPath = path.join(assetsDir, "continents.geojson")
    await writeFile(outputPath, JSON.stringify(processedData, null, 2))

    console.log(`✅ Successfully updated continents data: ${outputPath}`)
    console.log(`   Features: ${processedData.features.length}`)
    console.log(`   Resolution: ${source.resolution}`)
    console.log(`   Size: ${(JSON.stringify(processedData).length / 1024).toFixed(1)} KB`)

    // Also create a backup with timestamp
    const backupPath = path.join(assetsDir, `continents-backup-${Date.now()}.geojson`)
    await writeFile(backupPath, JSON.stringify(processedData, null, 2))
    console.log(`📦 Backup created: ${backupPath}`)
  } catch (error) {
    // @ts-ignore
    console.error(`❌ Failed to update continents data: ${error.message}`)
    throw error
  }
}

async function main(): Promise<void> {
  console.log("🌍 Maritime Routing - Continents Data Updater")
  console.log("=".repeat(50))

  // Get resolution preference from command line args
  const args = process.argv.slice(2)
  const preferredResolution = (args[0] as "low" | "medium" | "high") || "medium"

  console.log(`Preferred resolution: ${preferredResolution}`)

  // Find the best source for the preferred resolution
  const source =
    DOWNLOAD_SOURCES.find((s) => s.resolution === preferredResolution) ||
    DOWNLOAD_SOURCES.find((s) => s.resolution === "medium") ||
    DOWNLOAD_SOURCES[0]

  console.log(`Using source: ${source.description}`)
  console.log(`URL: ${source.url}`)
  console.log("")

  try {
    await updateContinentsData(source)
    console.log("")
    console.log("🎉 Update completed successfully!")
    console.log("")
    console.log("Next steps:")
    console.log("1. Test the application to ensure routing works correctly")
    console.log("2. Check that routes properly avoid land masses")
    console.log("3. Verify performance with the new data size")
    console.log("")
    console.log('If you experience performance issues, try running with "low" resolution:')
    console.log("npx ts-node scripts/update-continents-data.ts low")
  } catch (error) {
    console.error("")
    console.error("💥 Update failed!")
    console.error("")
    console.error("Troubleshooting:")
    console.error("1. Check your internet connection")
    console.error("2. Verify the source URLs are accessible")
    console.error("3. Ensure you have write permissions to src/assets/data/")
    console.error("4. Try a different resolution (low/medium/high)")

    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
export { updateContinentsData, DOWNLOAD_SOURCES }
