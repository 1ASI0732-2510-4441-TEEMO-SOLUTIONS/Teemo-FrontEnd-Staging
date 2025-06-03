import { Component, Input, type OnInit, type OnDestroy, type OnChanges, type SimpleChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import * as L from "leaflet"
import  { PortService, Port } from "../../../services/port.service"
import  { RouteCalculationResource } from "../../../services/route.service"

interface PortCoordinates {
  latitude: number
  longitude: number
}

interface RoutePort {
  name: string
  coordinates: PortCoordinates
}

// Interfaz para datos GeoJSON
interface GeoJSONFeature {
  type: "Feature"
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][] | number[][][][]
  }
  properties: any
}

interface GeoJSONData {
  type: "FeatureCollection"
  features: GeoJSONFeature[]
}

// Interfaz para representar un segmento de línea
interface LineSegment {
  start: { lat: number; lng: number }
  end: { lat: number; lng: number }
}

@Component({
  selector: "app-route-animation",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="route-animation-container">
      <!-- Controles de Animación -->
      <div class="animation-controls">
        <div class="control-group">
          <button
            class="control-btn"
            [class.active]="isAnimating"
            (click)="toggleAnimation()"
            [disabled]="!routePoints || routePoints.length === 0"
          >
            <svg
              *ngIf="!isAnimating"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg
              *ngIf="isAnimating"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            {{ isAnimating ? "Pausar" : "Iniciar" }} Animación
          </button>

          <button class="control-btn" (click)="resetAnimation()" [disabled]="!routePoints || routePoints.length === 0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Reiniciar
          </button>
        </div>

        <div class="speed-control">
          <label for="speed-slider">Velocidad:</label>
          <input
            id="speed-slider"
            type="range"
            min="1"
            max="10"
            [(ngModel)]="animationSpeed"
            (input)="updateAnimationSpeed()"
            class="speed-slider"
          />
          <span class="speed-value">{{ animationSpeed }}x</span>
        </div>
      </div>

      <!-- Estado de carga de GeoJSON -->
      <div class="geojson-status" *ngIf="!geoJsonLoaded">
        <div class="loading-indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-spin"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
          </svg>
          Cargando datos geográficos...
        </div>
      </div>

      <!-- Información de detección de tierra -->
      <div class="detection-info" *ngIf="geoJsonLoaded && lastDetectionInfo">
        <div class="info-card">
          <h4>Detección de Tierra</h4>
          <div class="detection-grid">
            <div class="detection-item">
              <span class="label">Línea directa cruza tierra:</span>
              <span class="value" [class.crosses]="lastDetectionInfo.directLineCrossesLand">
                {{ lastDetectionInfo.directLineCrossesLand ? "SÍ" : "NO" }}
              </span>
            </div>
            <div class="detection-item">
              <span class="label">Puntos de prueba:</span>
              <span class="value">{{ lastDetectionInfo.testPoints }}</span>
            </div>
            <div class="detection-item">
              <span class="label">Intersecciones detectadas:</span>
              <span class="value">{{ lastDetectionInfo.intersections }}</span>
            </div>
            <div class="detection-item">
              <span class="label">Dirección de curvatura:</span>
              <span class="value">{{ lastDetectionInfo.curveDirection > 0 ? "ESTE" : lastDetectionInfo.curveDirection < 0 ? "OESTE" : "RECTA" }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de la Ruta -->
      <div class="route-info" *ngIf="routeData">
        <div class="info-card">
          <h4>Información de la Ruta</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Distancia Total:</span>
              <span class="value">{{ routeData.totalDistance | number : "1.0-0" }} millas náuticas</span>
            </div>
            <div class="info-item">
              <span class="label">Puertos en la Ruta:</span>
              <span class="value">{{ routePorts.length }}</span>
            </div>
            <div class="info-item" *ngIf="currentPortIndex >= 0 && routePorts[currentPortIndex]">
              <span class="label">Puerto Actual:</span>
              <span class="value">{{ routePorts[currentPortIndex].name }}</span>
            </div>
            <div class="info-item" *ngIf="currentPortIndex >= 0 && routePorts[currentPortIndex + 1]">
              <span class="label">Próximo Puerto:</span>
              <span class="value">{{ routePorts[currentPortIndex + 1].name }}</span>
            </div>
            <div class="info-item" *ngIf="geoJsonLoaded">
              <span class="label">Detección de Tierra:</span>
              <span class="value">✓ Activa ({{ geoJsonFeatureCount }} características)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa -->
      <div class="map-container">
        <div id="route-map" class="map"></div>
      </div>

      <!-- Lista de Puertos -->
      <div class="ports-list" *ngIf="routePorts.length > 0">
        <h4>Puertos en la Ruta</h4>
        <div class="ports-grid">
          <div
            *ngFor="let port of routePorts; let i = index"
            class="port-item"
            [class.current]="i === currentPortIndex"
            [class.visited]="i < currentPortIndex"
            [class.pending]="i > currentPortIndex"
          >
            <div class="port-number">{{ i + 1 }}</div>
            <div class="port-details">
              <div class="port-name">{{ port.name }}</div>
              <div class="port-coordinates">
                {{ port.coordinates.latitude | number : "1.4-4" }}°,
                {{ port.coordinates.longitude | number : "1.4-4" }}°
              </div>
            </div>
            <div class="port-status">
              <svg
                *ngIf="i < currentPortIndex"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon visited"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg
                *ngIf="i === currentPortIndex"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon current"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <svg
                *ngIf="i > currentPortIndex"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="status-icon pending"
              >
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .route-animation-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background-color: white;
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .animation-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #f8fafc;
        border-radius: 0.375rem;
        border: 1px solid #e2e8f0;
      }

      .control-group {
        display: flex;
        gap: 0.5rem;
      }

      .control-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #0a6cbc;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;

        &:hover:not(:disabled) {
          background-color: #084e88;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &.active {
          background-color: #dc2626;

          &:hover {
            background-color: #b91c1c;
          }
        }

        svg {
          flex-shrink: 0;
        }
      }

      .speed-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;

        label {
          font-weight: 500;
          color: #374151;
        }
      }

      .speed-slider {
        width: 100px;
        height: 4px;
        border-radius: 2px;
        background: #e2e8f0;
        outline: none;
        cursor: pointer;

        &::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0a6cbc;
          cursor: pointer;
        }

        &::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0a6cbc;
          cursor: pointer;
          border: none;
        }
      }

      .speed-value {
        font-weight: 600;
        color: #0a6cbc;
        min-width: 2rem;
        text-align: center;
      }

      .geojson-status {
        padding: 0.75rem;
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 0.375rem;
        color: #92400e;
      }

      .loading-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .detection-info {
        margin-bottom: 1rem;
      }

      .detection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 0.75rem;
      }

      .detection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .value {
          font-size: 0.875rem;
          color: #0f172a;
          font-weight: 600;

          &.crosses {
            color: #dc2626;
          }
        }
      }

      .route-info {
        margin-bottom: 1rem;
      }

      .info-card {
        background-color: #f8fafc;
        border-radius: 0.375rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;

        h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .value {
          font-size: 0.875rem;
          color: #0f172a;
          font-weight: 600;
        }
      }

      .map-container {
        position: relative;
        height: 400px;
        border-radius: 0.375rem;
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }

      .map {
        width: 100%;
        height: 100%;
      }

      .ports-list {
        margin-top: 1rem;

        h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
      }

      .ports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 0.5rem;
      }

      .port-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background-color: #f8fafc;
        border-radius: 0.375rem;
        border: 1px solid #e2e8f0;
        transition: all 150ms ease;

        &.current {
          background-color: rgba(10, 108, 188, 0.1);
          border-color: #0a6cbc;
        }

        &.visited {
          background-color: rgba(34, 197, 94, 0.1);
          border-color: #22c55e;
        }

        &.pending {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
      }

      .port-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background-color: #e2e8f0;
        color: #475569;
        border-radius: 50%;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .port-item.current .port-number {
        background-color: #0a6cbc;
        color: white;
      }

      .port-item.visited .port-number {
        background-color: #22c55e;
        color: white;
      }

      .port-details {
        flex: 1;
        min-width: 0;
      }

      .port-name {
        font-weight: 600;
        color: #0f172a;
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      .port-coordinates {
        font-size: 0.75rem;
        color: #64748b;
        font-family: monospace;
      }

      .port-status {
        flex-shrink: 0;
      }

      .status-icon {
        &.visited {
          color: #22c55e;
        }

        &.current {
          color: #0a6cbc;
        }

        &.pending {
          color: #94a3b8;
        }
      }

      @media (max-width: 768px) {
        .animation-controls {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .control-group {
          justify-content: center;
        }

        .speed-control {
          justify-content: center;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }

        .detection-grid {
          grid-template-columns: 1fr;
        }

        .ports-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RouteAnimationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() originPortName = ""
  @Input() destinationPortName = ""
  @Input() intermediatePorts: Port[] = []
  @Input() routeData: RouteCalculationResource | null = null

  private map: L.Map | null = null
  private shipMarker: L.Marker | null = null
  private routePolyline: L.Polyline | null = null
  private traveledPolyline: L.Polyline | null = null
  private portMarkers: L.Marker[] = []
  private animationInterval: any = null

  // Propiedades de animación
  isAnimating = false
  animationSpeed = 3
  currentPointIndex = 0
  currentPortIndex = 0

  // Datos de la ruta
  routePoints: L.LatLng[] = []
  routePorts: RoutePort[] = []

  // Datos GeoJSON para detección de tierra
  private geoJsonData: GeoJSONData | null = null
  geoJsonLoaded = false
  geoJsonFeatureCount = 0

  // Información de detección para debugging
  lastDetectionInfo: {
    directLineCrossesLand: boolean
    testPoints: number
    intersections: number
    curveDirection: number
  } | null = null

  // Iconos personalizados
  private shipIcon = L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #dc2626;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 6px solid white;
        "></div>
      </div>
    `,
    className: "ship-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    this.initializeMap()
    this.loadGeoJSON()
  }

  ngOnDestroy(): void {
    this.stopAnimation()
    if (this.map) {
      this.map.remove()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["routeData"] && this.routeData) {
      console.log("RouteData recibida:", this.routeData)
      this.processRouteData()
    }
  }

  toggleAnimation(): void {
    if (this.isAnimating) {
      this.stopAnimation()
    } else {
      this.startAnimation()
    }
  }

  resetAnimation(): void {
    this.stopAnimation()
    this.currentPointIndex = 0
    this.currentPortIndex = 0

    if (this.shipMarker && this.routePoints.length > 0) {
      this.shipMarker.setLatLng(this.routePoints[0])
    }

    if (this.traveledPolyline) {
      this.traveledPolyline.setLatLngs([])
    }
  }

  updateAnimationSpeed(): void {
    if (this.isAnimating) {
      this.stopAnimation()
      this.startAnimation()
    }
  }

  private async loadGeoJSON(): Promise<void> {
    try {
      console.log("Cargando datos GeoJSON locales...")

      // Usar el archivo GeoJSON local del proyecto
      const response = await fetch("/assets/data/land-polygons.geojson")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      this.geoJsonData = await response.json()
      this.geoJsonLoaded = true
      this.geoJsonFeatureCount = this.geoJsonData?.features?.length || 0
      console.log("GeoJSON local cargado exitosamente:", this.geoJsonFeatureCount, "características")

      // Si ya tenemos datos de ruta, reprocesarlos con la nueva información geográfica
      if (this.routeData) {
        this.processRouteData()
      }
    } catch (error) {
      console.error("Error cargando GeoJSON local:", error)
      console.log("Intentando cargar GeoJSON de respaldo...")

      // Fallback al GeoJSON externo si el local falla
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        this.geoJsonData = await response.json()
        this.geoJsonLoaded = true
        this.geoJsonFeatureCount = this.geoJsonData?.features?.length || 0
        console.log("GeoJSON de respaldo cargado:", this.geoJsonFeatureCount, "características")

        if (this.routeData) {
          this.processRouteData()
        }
      } catch (fallbackError) {
        console.error("Error cargando GeoJSON de respaldo:", fallbackError)
        console.log("Continuando sin detección precisa de tierra...")
        this.geoJsonLoaded = false
      }
    }
  }

  private initializeMap(): void {
    // Inicializar el mapa centrado en el mundo
    this.map = L.map("route-map").setView([20, 0], 2)

    // Añadir capa de mapa
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(this.map)

    // Procesar datos de ruta si ya están disponibles
    if (this.routeData) {
      this.processRouteData()
    }
  }

  private processRouteData(): void {
    if (!this.routeData || !this.map) {
      console.log("No hay datos de ruta o mapa no inicializado")
      return
    }

    console.log("Procesando datos de ruta:", this.routeData)

    // Limpiar datos anteriores
    this.clearMap()
    this.routePorts = []
    this.routePoints = []

    // Verificar si tenemos coordinatesMapping (datos reales de la API)
    if (this.routeData.coordinatesMapping && this.routeData.optimalRoute) {
      console.log("Usando datos reales de la API")

      // Extraer puertos de la ruta óptima
      const portNames = this.routeData.optimalRoute
      console.log("Nombres de puertos en la ruta:", portNames)

      // Crear array de puertos con sus coordenadas
      portNames.forEach((portName) => {
        const coordinates = this.routeData!.coordinatesMapping![portName]
        if (coordinates) {
          this.routePorts.push({
            name: portName,
            coordinates: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
          })
        } else {
          console.warn(`No se encontraron coordenadas para el puerto: ${portName}`)
        }
      })

      console.log("Puertos procesados:", this.routePorts)

      // Cargar puertos y dibujar ruta
      this.loadPortsAndDrawRoute()
    } else {
      console.log("Usando datos simulados")
      // Fallback a datos simulados
      this.createSimulatedRoute()
    }
  }

  private loadPortsAndDrawRoute(): void {
    if (!this.map || this.routePorts.length === 0) {
      console.log("No hay mapa o puertos para mostrar")
      return
    }

    console.log("Cargando puertos y dibujando ruta. Puertos:", this.routePorts)

    // Mostrar TODOS los puertos de la ruta óptima
    this.routePorts.forEach((port, index) => {
      console.log(`Procesando puerto ${index + 1}:`, port.name, port.coordinates)

      // Determinar el tipo de puerto
      let portType: "origin" | "destination" | "route-port"

      if (index === 0) {
        portType = "origin"
      } else if (index === this.routePorts.length - 1) {
        portType = "destination"
      } else {
        portType = "route-port"
      }

      console.log(`Puerto ${port.name} será marcado como: ${portType}`)

      // Añadir el marcador del puerto
      this.addPortMarkerFromCoordinates(port.name, port.coordinates, portType)
    })

    // Crear puntos de ruta suaves conectando todos los puertos
    this.createRoutePointsFromRealPorts()

    // Ajustar el mapa para mostrar todos los puertos
    setTimeout(() => {
      this.fitMapToBounds()
    }, 100)
  }

  private createRoutePointsFromRealPorts(): void {
    if (this.routePorts.length < 2) {
      console.log("No hay suficientes puertos para crear una ruta")
      return
    }

    this.routePoints = []

    // Crear curvas inteligentes entre cada par de puertos consecutivos
    for (let i = 0; i < this.routePorts.length - 1; i++) {
      const currentPort = this.routePorts[i]
      const nextPort = this.routePorts[i + 1]

      console.log(`\n=== Creando ruta entre ${currentPort.name} y ${nextPort.name} ===`)

      // Crear curva inteligente evitando tierra
      const curvePoints = this.createIntelligentMaritimeCurve(currentPort.coordinates, nextPort.coordinates, 50)

      // Añadir los puntos de la curva
      if (i === 0) {
        this.routePoints.push(...curvePoints)
      } else {
        this.routePoints.push(...curvePoints.slice(1))
      }
    }

    console.log(`\nRuta marítima inteligente creada con ${this.routePoints.length} puntos`)
    this.drawRoute()
  }

  private createIntelligentMaritimeCurve(start: PortCoordinates, end: PortCoordinates, numPoints: number): L.LatLng[] {
    console.log(
      `Creando curva inteligente de [${start.latitude}, ${start.longitude}] a [${end.latitude}, ${end.longitude}]`,
    )

    // Primero, verificar si la línea directa cruza tierra con alta precisión
    const directLineCrossesLand = this.doesLineIntersectLandPrecise(start, end)

    // Información para debugging
    this.lastDetectionInfo = {
      directLineCrossesLand,
      testPoints: 100, // Usamos 100 puntos para la detección precisa
      intersections: 0,
      curveDirection: 0,
    }

    if (!directLineCrossesLand) {
      console.log("✓ Línea directa no cruza tierra, usando ruta recta")
      this.lastDetectionInfo.curveDirection = 0
      return this.createStraightLine(start, end, numPoints)
    }

    console.log("⚠ Línea directa cruza tierra, buscando ruta alternativa...")

    // Buscar la mejor curvatura usando múltiples intentos
    const bestCurve = this.findBestCurveDirection(start, end, numPoints)
    this.lastDetectionInfo.curveDirection = bestCurve.direction
    this.lastDetectionInfo.intersections = bestCurve.intersections

    console.log(
      `✓ Mejor curvatura encontrada: ${bestCurve.direction > 0 ? "ESTE" : "OESTE"} (${bestCurve.intersections} intersecciones)`,
    )

    return bestCurve.points
  }

  private doesLineIntersectLandPrecise(start: PortCoordinates, end: PortCoordinates): boolean {
    if (!this.geoJsonData) return false

    // Usar muchos más puntos para una detección más precisa
    const numTestPoints = 100
    const deltaLat = (end.latitude - start.latitude) / numTestPoints
    const deltaLng = (end.longitude - start.longitude) / numTestPoints

    // Verificar cada segmento pequeño de la línea
    for (let i = 0; i < numTestPoints; i++) {
      const lat1 = start.latitude + i * deltaLat
      const lng1 = start.longitude + i * deltaLng
      const lat2 = start.latitude + (i + 1) * deltaLat
      const lng2 = start.longitude + (i + 1) * deltaLng

      // Verificar si este segmento intersecta con tierra
      if (this.doesSegmentIntersectLand({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 })) {
        return true
      }
    }

    return false
  }

  private doesSegmentIntersectLand(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
  ): boolean {
    if (!this.geoJsonData) return false

    // Verificar si alguno de los puntos está en tierra
    if (this.isPointOnLand(point1.lat, point1.lng) || this.isPointOnLand(point2.lat, point2.lng)) {
      return true
    }

    // Verificar intersección de línea con polígonos de tierra
    const lineSegment: LineSegment = {
      start: point1,
      end: point2,
    }

    for (const feature of this.geoJsonData.features) {
      if (this.doesLineIntersectFeature(lineSegment, feature)) {
        return true
      }
    }

    return false
  }

  private doesLineIntersectFeature(line: LineSegment, feature: GeoJSONFeature): boolean {
    if (feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates as number[][][]
      return coordinates.some((ring) => this.doesLineIntersectPolygon(line, ring))
    } else if (feature.geometry.type === "MultiPolygon") {
      const coordinates = feature.geometry.coordinates as number[][][][]
      return coordinates.some((polygon) => polygon.some((ring) => this.doesLineIntersectPolygon(line, ring)))
    }
    return false
  }

  private doesLineIntersectPolygon(line: LineSegment, polygon: number[][]): boolean {
    // Verificar intersección con cada borde del polígono
    for (let i = 0; i < polygon.length - 1; i++) {
      const edge = {
        start: { lat: polygon[i][1], lng: polygon[i][0] },
        end: { lat: polygon[i + 1][1], lng: polygon[i + 1][0] },
      }

      if (this.doLinesIntersect(line, edge)) {
        return true
      }
    }
    return false
  }

  private doLinesIntersect(line1: LineSegment, line2: LineSegment): boolean {
    // Algoritmo de intersección de líneas usando determinantes
    const x1 = line1.start.lng,
      y1 = line1.start.lat
    const x2 = line1.end.lng,
      y2 = line1.end.lat
    const x3 = line2.start.lng,
      y3 = line2.start.lat
    const x4 = line2.end.lng,
      y4 = line2.end.lat

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

    if (Math.abs(denom) < 1e-10) {
      return false // Líneas paralelas
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

    return t >= 0 && t <= 1 && u >= 0 && u <= 1
  }

  private findBestCurveDirection(
    start: PortCoordinates,
    end: PortCoordinates,
    numPoints: number,
  ): {
    direction: number
    points: L.LatLng[]
    intersections: number
  } {
    const testDirections = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2] // Múltiples direcciones y intensidades
    let bestOption = {
      direction: 1,
      points: this.createStraightLine(start, end, numPoints),
      intersections: Number.MAX_SAFE_INTEGER,
    }

    for (const direction of testDirections) {
      const curvePoints = this.createCurveWithDirection(start, end, direction, numPoints)
      const intersections = this.countCurveIntersections(curvePoints)

      console.log(`Probando dirección ${direction}: ${intersections} intersecciones`)

      if (intersections < bestOption.intersections) {
        bestOption = {
          direction,
          points: curvePoints,
          intersections,
        }
      }

      // Si encontramos una ruta sin intersecciones, la usamos
      if (intersections === 0) {
        console.log(`✓ Ruta sin intersecciones encontrada con dirección ${direction}`)
        break
      }
    }

    return bestOption
  }

  private createCurveWithDirection(
    start: PortCoordinates,
    end: PortCoordinates,
    direction: number,
    numPoints: number,
  ): L.LatLng[] {
    const points: L.LatLng[] = []
    const deltaLat = end.latitude - start.latitude
    const deltaLng = end.longitude - start.longitude
    const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng)

    // Calcular curvatura adaptativa basada en la distancia
    const baseCurvature = Math.min(distance * 0.3, 30)
    const curvature = baseCurvature * Math.abs(direction)

    // Punto medio
    const midLat = (start.latitude + end.latitude) / 2
    const midLng = (start.longitude + end.longitude) / 2

    // Calcular punto de control perpendicular
    const perpLat = (-deltaLng / distance) * curvature * Math.sign(direction)
    const perpLng = (deltaLat / distance) * curvature * Math.sign(direction)

    const controlLat = midLat + perpLat
    const controlLng = midLng + perpLng

    // Generar puntos de la curva de Bézier cuadrática
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const lat = Math.pow(1 - t, 2) * start.latitude + 2 * (1 - t) * t * controlLat + Math.pow(t, 2) * end.latitude
      const lng = Math.pow(1 - t, 2) * start.longitude + 2 * (1 - t) * t * controlLng + Math.pow(t, 2) * end.longitude
      points.push(L.latLng(lat, lng))
    }

    return points
  }

  private countCurveIntersections(points: L.LatLng[]): number {
    if (!this.geoJsonData) return 0

    let intersections = 0

    // Verificar cada segmento de la curva
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = { lat: points[i].lat, lng: points[i].lng }
      const point2 = { lat: points[i + 1].lat, lng: points[i + 1].lng }

      if (this.doesSegmentIntersectLand(point1, point2)) {
        intersections++
      }
    }

    return intersections
  }

  private createStraightLine(start: PortCoordinates, end: PortCoordinates, numPoints: number): L.LatLng[] {
    const points: L.LatLng[] = []
    const deltaLat = end.latitude - start.latitude
    const deltaLng = end.longitude - start.longitude

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const lat = start.latitude + t * deltaLat
      const lng = start.longitude + t * deltaLng
      points.push(L.latLng(lat, lng))
    }

    return points
  }

  private isPointOnLand(lat: number, lng: number): boolean {
    if (!this.geoJsonData) return false

    // Verificar si el punto está dentro de algún polígono de tierra
    for (const feature of this.geoJsonData.features) {
      if (feature.geometry.type === "Polygon") {
        const coordinates = feature.geometry.coordinates as number[][][]
        if (coordinates.length > 0 && this.isPointInPolygon(lat, lng, coordinates[0])) {
          return true
        }
      } else if (feature.geometry.type === "MultiPolygon") {
        const coordinates = feature.geometry.coordinates as number[][][][]
        for (const polygon of coordinates) {
          if (polygon.length > 0 && this.isPointInPolygon(lat, lng, polygon[0])) {
            return true
          }
        }
      }
    }
    return false
  }

  private isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    // Algoritmo de ray casting mejorado
    let inside = false
    const x = lng
    const y = lat

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]
      const yi = polygon[i][1]
      const xj = polygon[j][0]
      const yj = polygon[j][1]

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside
      }
    }

    return inside
  }

  private createSimulatedRoute(): void {
    // Crear una ruta simulada simple si no hay datos reales
    console.log("Creando ruta simulada")

    this.routePorts = [
      { name: this.originPortName || "Puerto Origen", coordinates: { latitude: 35.6895, longitude: 139.6917 } },
      { name: "Puerto Intermedio 1", coordinates: { latitude: 1.3521, longitude: 103.8198 } },
      { name: this.destinationPortName || "Puerto Destino", coordinates: { latitude: -33.0472, longitude: -71.6128 } },
    ]

    this.loadPortsAndDrawRoute()
  }

  private clearMap(): void {
    if (!this.map) return

    // Limpiar marcadores de puertos
    this.portMarkers.forEach((marker) => {
      this.map!.removeLayer(marker)
    })
    this.portMarkers = []

    // Limpiar rutas
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline)
      this.routePolyline = null
    }
    if (this.traveledPolyline) {
      this.map.removeLayer(this.traveledPolyline)
      this.traveledPolyline = null
    }

    // Limpiar marcador del barco
    if (this.shipMarker) {
      this.map.removeLayer(this.shipMarker)
      this.shipMarker = null
    }
  }

  private fitMapToBounds(): void {
    if (!this.map || this.routePoints.length === 0) {
      return
    }

    const group = new L.FeatureGroup(this.portMarkers)
    this.map.fitBounds(group.getBounds().pad(0.1))
  }

  private addPortMarkerFromCoordinates(
    portName: string,
    coordinates: PortCoordinates,
    type: "origin" | "destination" | "route-port",
  ): void {
    if (!coordinates || !this.map) {
      console.error(`Coordenadas inválidas para el puerto ${portName}:`, coordinates)
      return
    }

    if (typeof coordinates.latitude !== "number" || typeof coordinates.longitude !== "number") {
      console.error(`Coordenadas no son números válidos para ${portName}:`, coordinates)
      return
    }

    try {
      let iconColor = "#6b7280" // Gris por defecto para puertos intermedios
      let iconSize = 25

      if (type === "origin") {
        iconColor = "#22c55e" // Verde para origen
        iconSize = 30
      } else if (type === "destination") {
        iconColor = "#dc2626" // Rojo para destino
        iconSize = 30
      } else if (type === "route-port") {
        iconColor = "#8b5cf6" // Morado para puertos de ruta
        iconSize = 25
      }

      const portIcon = L.divIcon({
        html: `
        <div style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          background-color: ${iconColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path>
            <path d="M12 12v9"></path>
            <path d="M8 17h8"></path>
          </svg>
        </div>
      `,
        className: `port-marker port-${type}`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
      })

      const marker = L.marker([coordinates.latitude, coordinates.longitude], { icon: portIcon })
        .addTo(this.map)
        .bindPopup(`
        <div style="text-align: center;">
          <strong>${portName}</strong><br>
          <small>Tipo: ${type === "origin" ? "Origen" : type === "destination" ? "Destino" : "Puerto de Ruta"}</small><br>
          <small>${coordinates.latitude.toFixed(4)}°, ${coordinates.longitude.toFixed(4)}°</small>
        </div>
      `)

      this.portMarkers.push(marker)
      console.log(`Marcador añadido para ${portName} (${type}) en:`, coordinates)
    } catch (error) {
      console.error(`Error al crear marcador para ${portName}:`, error)
    }
  }

  private drawRoute(): void {
    if (!this.map || this.routePoints.length === 0) {
      return
    }

    // Limpiar rutas anteriores
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline)
    }
    if (this.traveledPolyline) {
      this.map.removeLayer(this.traveledPolyline)
    }

    // Dibujar la ruta completa (en gris)
    this.routePolyline = L.polyline(this.routePoints, {
      color: "#cbd5e1",
      weight: 4,
      opacity: 0.7,
    }).addTo(this.map)

    // Dibujar la ruta recorrida (inicialmente vacía)
    this.traveledPolyline = L.polyline([], {
      color: "#0a6cbc",
      weight: 4,
      opacity: 0.9,
    }).addTo(this.map)
  }

  private startAnimation(): void {
    if (!this.routePoints || this.routePoints.length === 0) {
      console.log("No hay puntos de ruta para animar")
      return
    }

    this.isAnimating = true

    // Crear marcador del barco si no existe
    if (!this.shipMarker && this.map) {
      this.shipMarker = L.marker(this.routePoints[this.currentPointIndex], {
        icon: this.shipIcon,
      }).addTo(this.map)
    }

    // Iniciar la animación
    this.animationInterval = setInterval(() => {
      this.animateStep()
    }, 100 / this.animationSpeed)
  }

  private animateStep(): void {
    if (!this.shipMarker || !this.traveledPolyline || this.currentPointIndex >= this.routePoints.length - 1) {
      this.stopAnimation()
      return
    }

    // Mover el barco al siguiente punto
    this.currentPointIndex++
    const currentPoint = this.routePoints[this.currentPointIndex]
    this.shipMarker.setLatLng(currentPoint)

    // Actualizar la línea recorrida
    const traveledPoints = this.routePoints.slice(0, this.currentPointIndex + 1)
    this.traveledPolyline.setLatLngs(traveledPoints)

    // Actualizar el puerto actual
    this.updateCurrentPort()
  }

  private updateCurrentPort(): void {
    // Calcular qué puerto está más cerca del punto actual
    if (this.routePorts.length === 0) return

    let closestPortIndex = 0
    let minDistance = Number.MAX_VALUE

    const currentPoint = this.routePoints[this.currentPointIndex]

    this.routePorts.forEach((port, index) => {
      const portLatLng = L.latLng(port.coordinates.latitude, port.coordinates.longitude)
      const distance = currentPoint.distanceTo(portLatLng)

      if (distance < minDistance) {
        minDistance = distance
        closestPortIndex = index
      }
    })

    this.currentPortIndex = closestPortIndex
  }

  private stopAnimation(): void {
    this.isAnimating = false
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
      this.animationInterval = null
    }
  }
}
