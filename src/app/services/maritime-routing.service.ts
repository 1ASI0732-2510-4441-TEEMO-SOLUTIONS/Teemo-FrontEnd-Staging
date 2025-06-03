import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { type Observable, of, BehaviorSubject } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import * as turf from "@turf/turf"
import  { Feature, FeatureCollection, Polygon, MultiPolygon, LineString, Point } from "geojson"

export interface MaritimeWaypoint {
  name: string
  coordinates: [number, number]
  type: "port" | "canal" | "waypoint"
  description?: string
}

export interface MaritimeRoute {
  coordinates: [number, number][]
  distance: number
  estimatedTime: number
  warnings: string[]
  waypoints: MaritimeWaypoint[]
}

export interface Canal {
  name: string
  entry: [number, number]
  exit: [number, number]
  width: number
}

@Injectable({
  providedIn: "root",
})
export class MaritimeRoutingService {
  private landPolygons: FeatureCollection<Polygon | MultiPolygon> | null = null
  private bufferedLandPolygons: FeatureCollection<Polygon | MultiPolygon> | null = null
  private readonly DEFAULT_BUFFER_KM = 15 // Aumentado de 5km a 15km
  private isLoaded = new BehaviorSubject<boolean>(false)

  // Canales principales del mundo (expandido)
  private readonly MAJOR_CANALS: Canal[] = [
    {
      name: "Canal de Panamá",
      entry: [-79.9167, 8.9667],
      exit: [-79.5667, 9.0833],
      width: 0.1,
    },
    {
      name: "Canal de Suez",
      entry: [32.3, 29.9],
      exit: [32.3, 31.3],
      width: 0.05,
    },
    {
      name: "Estrecho de Gibraltar",
      entry: [-5.6, 35.9],
      exit: [-5.3, 36.1],
      width: 0.2,
    },
    {
      name: "Estrecho de Malaca",
      entry: [100.3, 1.4],
      exit: [103.8, 1.3],
      width: 0.3,
    },
    {
      name: "Canal de la Mancha",
      entry: [-1.0, 50.0],
      exit: [2.0, 51.0],
      width: 0.5,
    },
    {
      name: "Estrecho de Bering",
      entry: [-169.0, 65.5],
      exit: [-168.0, 66.0],
      width: 0.3,
    },
    {
      name: "Estrecho de Ormuz",
      entry: [56.0, 26.0],
      exit: [57.0, 26.5],
      width: 0.2,
    },
    {
      name: "Estrecho de Bab el-Mandeb",
      entry: [43.0, 12.5],
      exit: [43.5, 13.0],
      width: 0.2,
    },
  ]

  // Waypoints estratégicos para evitar tierra
  private readonly STRATEGIC_WAYPOINTS: MaritimeWaypoint[] = [
    { name: "Cabo de Buena Esperanza", coordinates: [18.5, -34.5], type: "waypoint", description: "Ruta África-Asia" },
    { name: "Cabo de Hornos", coordinates: [-67.0, -56.0], type: "waypoint", description: "Ruta Atlántico-Pacífico" },
    { name: "Cabo Norte", coordinates: [25.0, 71.0], type: "waypoint", description: "Ruta Ártica" },
    { name: "Estrecho de Torres", coordinates: [142.0, -10.0], type: "waypoint", description: "Australia-Asia" },
    { name: "Paso de Drake", coordinates: [-65.0, -58.0], type: "waypoint", description: "Antártida" },
    { name: "Mar del Norte", coordinates: [3.0, 56.0], type: "waypoint", description: "Europa Norte" },
    { name: "Golfo Pérsico", coordinates: [52.0, 27.0], type: "waypoint", description: "Medio Oriente" },
    { name: "Mar Rojo", coordinates: [38.0, 20.0], type: "waypoint", description: "África-Asia" },
  ]

  constructor(private http: HttpClient) {
    this.loadLandData()
  }

  private loadLandData(): void {
    console.log("🌍 Loading land data from /assets/data/land-polygons.geojson...")
    this.http
      .get<FeatureCollection<Polygon | MultiPolygon>>("/assets/data/land-polygons.geojson")
      .pipe(
        tap((data) => {
          console.log("✅ Land data loaded successfully:", data.features.length, "polygons")
          console.log("📊 Land data structure:", {
            type: data.type,
            featuresCount: data.features.length,
            firstFeature: data.features[0]
              ? {
                type: data.features[0].type,
                geometryType: data.features[0].geometry.type,
                propertiesName: data.features[0].properties?.["name"],
              }
              : null,
          })
        }),
        catchError((error) => {
          console.error("❌ Error loading land data:", error)
          console.error("🔍 Check if file exists at: /assets/data/land-polygons.geojson")
          return of({ type: "FeatureCollection", features: [] } as FeatureCollection<Polygon | MultiPolygon>)
        }),
      )
      .subscribe((data) => {
        this.landPolygons = data
        this.createBufferedLandPolygons()
        this.isLoaded.next(true)
        console.log(`🎯 Maritime routing service ready with ${data.features.length} land polygons`)
      })
  }

  private createBufferedLandPolygons(bufferKm: number = this.DEFAULT_BUFFER_KM): void {
    if (!this.landPolygons) return

    console.log(`🛡️ Creating buffered land polygons with ${bufferKm}km buffer...`)

    try {
      const bufferedFeatures: Feature<Polygon | MultiPolygon>[] = []

      for (const feature of this.landPolygons.features) {
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          // Usar kilómetros directamente en lugar de convertir a grados
          const buffered = turf.buffer(feature as Feature<Polygon | MultiPolygon>, bufferKm, { units: "kilometers" })

          if (buffered && buffered.geometry) {
            bufferedFeatures.push(buffered as Feature<Polygon | MultiPolygon>)
          }
        }
      }

      this.bufferedLandPolygons = {
        type: "FeatureCollection",
        features: bufferedFeatures,
      }

      console.log(`✅ Created ${bufferedFeatures.length} buffered land polygons`)
    } catch (error) {
      console.error("❌ Error creating buffered land polygons:", error)
      this.bufferedLandPolygons = this.landPolygons // Fallback to original
    }
  }

  public isServiceReady(): Observable<boolean> {
    return this.isLoaded.asObservable()
  }

  public calculateMaritimeRoute(
    start: [number, number],
    end: [number, number],
    options: {
      avoidLand?: boolean
      useCanals?: boolean
      maxDetourFactor?: number
      precision?: number
    } = {},
  ): Observable<MaritimeRoute> {
    // Valor predeterminado de precision reducido a 20 para mayor detalle
    const { avoidLand = true, useCanals = true, maxDetourFactor = 2.0, precision = 20 } = options

    console.log("🚢 Calculating maritime route...")
    console.log("📍 Start:", start)
    console.log("📍 End:", end)
    console.log("⚙️ Options:", options)
    console.log("🌍 Land polygons available:", this.landPolygons ? this.landPolygons.features.length : 0)

    if (!this.landPolygons) {
      console.warn("⚠️ Land data not available, using direct route")
      return of(this.createDirectRoute(start, end, ["Land data not loaded"]))
    }

    try {
      // Crear línea directa inicial
      const directLine = turf.lineString([start, end])
      const directDistance = turf.length(directLine, { units: "kilometers" })

      console.log("📏 Direct distance:", directDistance.toFixed(2), "km")

      // Verificar si la ruta directa cruza tierra
      const crossesLand = this.routeCrossesLand(directLine)
      console.log("🌍 Route crosses land:", crossesLand)

      if (!avoidLand || !crossesLand) {
        console.log("✅ Using direct route (no land crossing or avoidance disabled)")
        return of({
          coordinates: [start, end],
          distance: directDistance,
          estimatedTime: this.calculateEstimatedTime(directDistance),
          warnings: crossesLand ? ["Direct route crosses land but avoidance disabled"] : [],
          waypoints: [
            { name: "Origen", coordinates: start, type: "port" },
            { name: "Destino", coordinates: end, type: "port" },
          ],
        })
      }

      console.log("🔄 Calculating maritime route avoiding land...")
      // Calcular ruta marítima evitando tierra con mayor precisión
      const maritimeRoute = this.calculateRouteAvoidingLand(start, end, useCanals, precision)

      // Verificar si el desvío es razonable
      if (maritimeRoute.distance > directDistance * maxDetourFactor) {
        console.warn(
          `⚠️ Maritime route very long (${maritimeRoute.distance.toFixed(0)}km vs ${directDistance.toFixed(0)}km direct)`,
        )
        maritimeRoute.warnings.push("Route significantly longer than direct")
      }

      console.log("✅ Maritime route calculated successfully")
      console.log("📏 Maritime distance:", maritimeRoute.distance.toFixed(2), "km")
      console.log("📍 Route points:", maritimeRoute.coordinates.length)

      return of(maritimeRoute)
    } catch (error) {
      console.error("❌ Error calculating maritime route:", error)
      return of(this.createDirectRoute(start, end, ["Error in maritime calculation, using direct route"]))
    }
  }

  private routeCrossesLand(route: Feature<LineString>): boolean {
    if (!this.landPolygons) return false

    try {
      for (const feature of this.landPolygons.features) {
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          const intersection = turf.lineIntersect(route, feature as Feature<Polygon | MultiPolygon>)
          if (intersection.features.length > 0) {
            console.log(`🌍 Route intersects with: ${feature.properties?.["name"] || "Unknown land mass"}`)
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error("Error verificando intersección con tierra:", error)
      return false
    }
  }

  private calculateRouteAvoidingLand(
    start: [number, number],
    end: [number, number],
    useCanals: boolean,
    precision: number,
  ): MaritimeRoute {
    const waypoints: MaritimeRoute["waypoints"] = [{ name: "Origen", coordinates: start, type: "port" }]

    let coordinates: [number, number][] = [start]
    const warnings: string[] = []

    try {
      // Buscar canal apropiado si está habilitado
      if (useCanals) {
        const canal = this.findBestCanal(start, end)
        if (canal) {
          console.log(`🚢 Using canal: ${canal.name}`)
          const routeToCanalEntry = this.createSafeRoute(start, canal.entry, precision)
          const routeFromCanalExit = this.createSafeRoute(canal.exit, end, precision)

          // Corrección: evitar duplicados en los puntos de transición del canal
          coordinates = [
            ...routeToCanalEntry.slice(0, -1), // Puntos hasta justo ANTES de canal.entry
            canal.entry, // El punto exacto de entrada al canal
            canal.exit, // El punto exacto de salida del canal
            ...routeFromCanalExit.slice(1), // Puntos desde justo DESPUÉS de canal.exit
          ]

          waypoints.push(
            { name: `${canal.name} - Entrada`, coordinates: canal.entry, type: "canal" },
            { name: `${canal.name} - Salida`, coordinates: canal.exit, type: "canal" },
          )
        } else {
          // Ruta costera sin canal
          coordinates = this.createCoastalRoute(start, end, precision)
        }
      } else {
        // Ruta costera sin canales
        coordinates = this.createCoastalRoute(start, end, precision)
      }

      // Agregar waypoints estratégicos si están cerca de la ruta
      const strategicWaypoints = this.findStrategicWaypoints(start, end)
      waypoints.push(...strategicWaypoints)

      waypoints.push({ name: "Destino", coordinates: end, type: "port" })

      const totalDistance = this.calculateRouteDistance(coordinates)

      coordinates = this.createCompleteRouteWithPortConnections(start, end, coordinates)

      return {
        coordinates,
        distance: totalDistance,
        estimatedTime: this.calculateEstimatedTime(totalDistance),
        warnings,
        waypoints,
      }
    } catch (error) {
      console.error("Error en cálculo de ruta evitando tierra:", error)
      return this.createDirectRoute(start, end, ["Error en cálculo, usando ruta directa"])
    }
  }

  private findStrategicWaypoints(start: [number, number], end: [number, number]): MaritimeWaypoint[] {
    const relevantWaypoints: MaritimeWaypoint[] = []
    const routeBounds = this.getRouteBounds(start, end)

    for (const waypoint of this.STRATEGIC_WAYPOINTS) {
      const [lng, lat] = waypoint.coordinates
      if (
        lng >= routeBounds.minLng &&
        lng <= routeBounds.maxLng &&
        lat >= routeBounds.minLat &&
        lat <= routeBounds.maxLat
      ) {
        // Verificar si el waypoint está cerca de la ruta directa
        const directLine = turf.lineString([start, end])
        const waypointPoint = turf.point(waypoint.coordinates)
        const distance = turf.pointToLineDistance(waypointPoint, directLine, { units: "kilometers" })

        if (distance < 500) {
          // Si está a menos de 500km de la ruta directa
          relevantWaypoints.push(waypoint)
          console.log(`📍 Adding strategic waypoint: ${waypoint.name}`)
        }
      }
    }

    return relevantWaypoints
  }

  private getRouteBounds(start: [number, number], end: [number, number]) {
    return {
      minLng: Math.min(start[0], end[0]) - 5,
      maxLng: Math.max(start[0], end[0]) + 5,
      minLat: Math.min(start[1], end[1]) - 5,
      maxLat: Math.max(start[1], end[1]) + 5,
    }
  }

  private findBestCanal(start: [number, number], end: [number, number]): Canal | null {
    let bestCanal: Canal | null = null
    let bestSaving = 0

    const directDistance = turf.distance(start, end, { units: "kilometers" })

    for (const canal of this.MAJOR_CANALS) {
      const distanceViaCanal =
        turf.distance(start, canal.entry, { units: "kilometers" }) +
        turf.distance(canal.entry, canal.exit, { units: "kilometers" }) +
        turf.distance(canal.exit, end, { units: "kilometers" })

      const saving = directDistance - distanceViaCanal

      if (saving > bestSaving && saving > 300) {
        // Reducido de 500km a 300km para ser más flexible
        bestCanal = canal
        bestSaving = saving
      }
    }

    return bestCanal
  }

  private createSafeRoute(start: [number, number], end: [number, number], precision: number): [number, number][] {
    console.log("🛡️ Creating safe route between points...")

    const waypoints: [number, number][] = [start]

    // Calcular distancia para determinar número de puntos intermedios
    const distance = turf.distance(start, end, { units: "kilometers" })
    const steps = Math.max(10, Math.floor(distance / precision)) // Usar precision parameter

    console.log(`📏 Distance: ${distance.toFixed(2)}km, creating ${steps} intermediate points`)

    for (let i = 1; i < steps; i++) {
      const fraction = i / steps
      const lat = start[1] + (end[1] - start[1]) * fraction
      const lng = start[0] + (end[0] - start[0]) * fraction

      let foundSea = false
      let attempt = 0
      const maxAttempts = 10
      let multiplier = 1.0

      while (!foundSea && attempt < maxAttempts) {
        const offset = this.calculateSmartOceanOffset(start, end, [lng, lat], multiplier)
        const testLat = lat + offset[1]
        const testLng = lng + offset[0]
        const point = turf.point([testLng, testLat])

        if (!this.isPointOnBufferedLand(point)) {
          waypoints.push([testLng, testLat])
          foundSea = true
          if (attempt > 0) {
            console.log(`🌊 Found sea at attempt ${attempt} with multiplier ${multiplier.toFixed(1)}`)
          }
        } else {
          // Incremento más agresivo del multiplicador
          if (multiplier > 0) {
            multiplier = -(multiplier + 0.5) // Incremento más agresivo y cambio de signo
          } else {
            multiplier = -(multiplier - 0.5) // Incremento más agresivo y cambio de signo
          }
          // Asegurarse de que el multiplicador no se vuelva demasiado pequeño en magnitud
          if (Math.abs(multiplier) < 0.5) multiplier = Math.sign(multiplier) * 0.5
          attempt++
        }
      }

      if (!foundSea) {
        console.warn(`⚠️ Could not find sea after ${maxAttempts} attempts at fraction ${fraction}`)
        // Si no encuentra mar, usa un punto con offset mucho más grande
        const emergencyOffset = this.calculateSmartOceanOffset(start, end, [lng, lat], 10.0) // Aumentado de 5.0 a 10.0
        waypoints.push([lng + emergencyOffset[0], lat + emergencyOffset[1]])
      }
    }

    waypoints.push(end)

    console.log(`✅ Safe route created with ${waypoints.length} points`)
    return waypoints
  }

  private isPointOnLand(point: Feature<Point>): boolean {
    if (!this.landPolygons) return false

    try {
      for (const feature of this.landPolygons.features) {
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          if (turf.booleanPointInPolygon(point, feature as Feature<Polygon | MultiPolygon>)) {
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error("Error verificando si punto está en tierra:", error)
      return false
    }
  }

  private isPointOnBufferedLand(point: Feature<Point>): boolean {
    if (!this.bufferedLandPolygons) return this.isPointOnLand(point)

    try {
      for (const feature of this.bufferedLandPolygons.features) {
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          if (turf.booleanPointInPolygon(point, feature as Feature<Polygon | MultiPolygon>)) {
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error("Error verificando si punto está en tierra bufferizada:", error)
      return false
    }
  }

  private isPortAccessible(portCoordinates: [number, number]): boolean {
    const point = turf.point(portCoordinates)

    // Los puertos se consideran accesibles incluso si están en tierra original
    // pero no si están muy adentro de tierra bufferizada
    const onOriginalLand = this.isPointOnLand(point)
    const onBufferedLand = this.isPointOnBufferedLand(point)

    if (!onOriginalLand) {
      // Puerto en mar abierto - siempre accesible
      return true
    }

    if (onOriginalLand && !onBufferedLand) {
      // Puerto en tierra original pero no en zona bufferizada - accesible
      return true
    }

    // Puerto en zona bufferizada - necesita verificación especial
    console.log(`⚠️ Port at [${portCoordinates}] is in buffered zone, allowing access`)
    return true // Permitir acceso a puertos incluso en zona bufferizada
  }

  private createPortConnection(
    portCoordinates: [number, number],
    nextWaypoint: [number, number],
    isStartPort = true,
  ): [number, number][] {
    console.log(`🏗️ Creating ${isStartPort ? "departure" : "arrival"} connection for port`)

    const connection: [number, number][] = [portCoordinates]

    // Crear puntos intermedios para salir/entrar al puerto de forma segura
    const distance = turf.distance(portCoordinates, nextWaypoint, { units: "kilometers" })
    const steps = Math.min(5, Math.max(2, Math.floor(distance / 10))) // 2-5 pasos según distancia

    for (let i = 1; i < steps; i++) {
      const fraction = i / steps
      const lat = portCoordinates[1] + (nextWaypoint[1] - portCoordinates[1]) * fraction
      const lng = portCoordinates[0] + (nextWaypoint[0] - portCoordinates[0]) * fraction

      // Para conexiones de puerto, usar verificación menos estricta
      const point = turf.point([lng, lat])
      if (!this.isPointOnBufferedLand(point)) {
        connection.push([lng, lat])
      } else {
        // Si el punto está en zona bufferizada, aplicar un pequeño offset hacia el mar
        const offset = this.calculateSmartOceanOffset(portCoordinates, nextWaypoint, [lng, lat], 0.5)
        connection.push([lng + offset[0], lat + offset[1]])
      }
    }

    if (!isStartPort) {
      connection.push(nextWaypoint)
    }

    console.log(`✅ Port connection created with ${connection.length} points`)
    return connection
  }

  private createCoastalRoute(start: [number, number], end: [number, number], precision: number): [number, number][] {
    console.log("🏖️ Creating coastal route with multiple waypoints...")

    // Crear más puntos intermedios para una ruta más realista
    const waypoints: [number, number][] = [start]

    // Calcular la distancia total para determinar el número de puntos
    const totalDistance = turf.distance(start, end, { units: "kilometers" })
    const numberOfSegments = Math.max(15, Math.floor(totalDistance / precision)) // Usar precision

    console.log(`📏 Total distance: ${totalDistance.toFixed(2)}km, creating ${numberOfSegments} segments`)

    for (let i = 1; i < numberOfSegments; i++) {
      const fraction = i / numberOfSegments
      const lat = start[1] + (end[1] - start[1]) * fraction
      const lng = start[0] + (end[0] - start[0]) * fraction

      let foundSea = false
      let attempt = 0
      const maxAttempts = 10
      let multiplier = 1.0

      while (!foundSea && attempt < maxAttempts) {
        const offset = this.calculateSmartOceanOffset(start, end, [lng, lat], multiplier)
        const testLat = lat + offset[1]
        const testLng = lng + offset[0]
        const point = turf.point([testLng, testLat])

        if (!this.isPointOnBufferedLand(point)) {
          waypoints.push([testLng, testLat])
          foundSea = true
          if (attempt > 0) {
            console.log(`🌊 Found sea at attempt ${attempt} with multiplier ${multiplier.toFixed(1)}`)
          }
        } else {
          // Incremento más agresivo del multiplicador
          if (multiplier > 0) {
            multiplier = -(multiplier + 0.5) // Incremento más agresivo y cambio de signo
          } else {
            multiplier = -(multiplier - 0.5) // Incremento más agresivo y cambio de signo
          }
          // Asegurarse de que el multiplicador no se vuelva demasiado pequeño en magnitud
          if (Math.abs(multiplier) < 0.5) multiplier = Math.sign(multiplier) * 0.5
          attempt++
        }
      }

      if (!foundSea) {
        console.warn(`⚠️ Could not find sea after ${maxAttempts} attempts at fraction ${fraction}`)
        // Si no encuentra mar, usa un punto con offset mucho más grande
        const emergencyOffset = this.calculateSmartOceanOffset(start, end, [lng, lat], 10.0) // Aumentado de 5.0 a 10.0
        waypoints.push([lng + emergencyOffset[0], lat + emergencyOffset[1]])
      }
    }

    waypoints.push(end)

    console.log(`✅ Coastal route created with ${waypoints.length} waypoints`)
    return waypoints
  }

  private calculateSmartOceanOffset(
    start: [number, number],
    end: [number, number],
    currentPoint: [number, number],
    multiplier = 1.0,
  ): [number, number] {
    // Calcular offset perpendicular hacia el océano
    const dx = end[0] - start[0]
    const dy = end[1] - start[1]

    // Vector perpendicular normalizado
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length === 0) return [0, 0]

    const perpX = -dy / length
    const perpY = dx / length

    // Offset adaptativo basado en la latitud (más grande cerca de los polos)
    const latitudeFactor = 1 + Math.abs(currentPoint[1]) / 90
    // Aumentar significativamente la magnitud base del offset para mayor evasión
    const baseOffsetMagnitude = 0.8 // Aumentado de 0.3 a 0.8 para mayor agresividad
    const offsetMagnitude = baseOffsetMagnitude * multiplier * latitudeFactor

    // Determinar dirección del offset basado en la posición relativa
    const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
    const toMid = [midPoint[0] - currentPoint[0], midPoint[1] - currentPoint[1]]

    // Usar el producto cruzado para determinar la dirección
    const cross = perpX * toMid[1] - perpY * toMid[0]
    const direction = cross > 0 ? 1 : -1

    return [perpX * offsetMagnitude * direction, perpY * offsetMagnitude * direction]
  }

  private calculateRouteDistance(coordinates: [number, number][]): number {
    if (coordinates.length < 2) return 0

    let totalDistance = 0
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += turf.distance(coordinates[i], coordinates[i + 1], { units: "kilometers" })
    }

    return totalDistance
  }

  private calculateEstimatedTime(distanceKm: number): number {
    // Velocidad promedio de 20 nudos = ~37 km/h
    const averageSpeedKmh = 37
    return distanceKm / averageSpeedKmh
  }

  private createDirectRoute(start: [number, number], end: [number, number], warnings: string[] = []): MaritimeRoute {
    const distance = turf.distance(start, end, { units: "kilometers" })

    return {
      coordinates: [start, end],
      distance,
      estimatedTime: this.calculateEstimatedTime(distance),
      warnings,
      waypoints: [
        { name: "Origen", coordinates: start, type: "port" },
        { name: "Destino", coordinates: end, type: "port" },
      ],
    }
  }

  private createCompleteRouteWithPortConnections(
    start: [number, number],
    end: [number, number],
    mainRoute: [number, number][],
  ): [number, number][] {
    console.log("🔗 Creating complete route with port connections...")

    let completeRoute: [number, number][] = []

    // Verificar accesibilidad de puertos
    const startPortAccessible = this.isPortAccessible(start)
    const endPortAccessible = this.isPortAccessible(end)

    if (!startPortAccessible) {
      console.warn("⚠️ Start port may not be accessible")
    }
    if (!endPortAccessible) {
      console.warn("⚠️ End port may not be accessible")
    }

    // Conexión de salida del puerto de origen
    if (mainRoute.length > 1) {
      const departureConnection = this.createPortConnection(start, mainRoute[1], true)
      completeRoute = [...departureConnection]

      // Agregar ruta principal (sin el primer punto que ya está en la conexión)
      completeRoute = [...completeRoute, ...mainRoute.slice(1)]

      // Conexión de llegada al puerto de destino
      if (mainRoute.length > 2) {
        const arrivalConnection = this.createPortConnection(end, mainRoute[mainRoute.length - 2], false)
        // Reemplazar el último punto con la conexión de llegada
        completeRoute = [...completeRoute.slice(0, -1), ...arrivalConnection]
      }
    } else {
      // Ruta directa - crear conexión simple
      completeRoute = mainRoute
    }

    console.log(`✅ Complete route created with ${completeRoute.length} points`)
    return completeRoute
  }
}
