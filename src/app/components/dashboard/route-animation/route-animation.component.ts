import { Component, Input, type OnInit, type OnDestroy, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import * as L from "leaflet"
import  { RouteCalculationResource } from "../../../services/route.service"
import  { PortService, Port } from "../../../services/port.service"
import { Subscription } from "rxjs"

@Component({
  selector: "app-route-animation",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="route-animation-container">
      <div class="route-animation-header">
        <h3>Visualización de Ruta Marítima</h3>
        <div class="route-info" *ngIf="routeData">
          <div class="route-ports">
            <span class="port-label">Origen:</span>
            <span class="port-value">{{ startPortName }}</span>
            <span class="route-separator">→</span>
            <span class="port-label">Destino:</span>
            <span class="port-value">{{ endPortName }}</span>
          </div>
          <div class="route-distance">
            <span class="distance-label">Distancia:</span>
            <span class="distance-value">{{ routeData.totalDistance.toFixed(2) }} millas náuticas</span>
          </div>
        </div>
        <div class="animation-controls">
          <button class="control-btn" (click)="startAnimation()" [disabled]="isAnimating">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Iniciar Animación
          </button>
          <button class="control-btn" (click)="resetAnimation()" [disabled]="!hasAnimated">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 2v6h6"></path>
              <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
            </svg>
            Reiniciar
          </button>
          <button class="control-btn close-btn" (click)="closeAnimation()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cerrar
          </button>
        </div>
      </div>

      <div class="route-warnings" *ngIf="routeData && routeData.warnings && routeData.warnings.length > 0">
        <div class="warning-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="warning-messages">
          <p *ngFor="let warning of routeData.warnings">{{ warning }}</p>
        </div>
      </div>

      <div id="route-animation-map" class="route-animation-map"></div>

      <div class="animation-progress" *ngIf="routeData">
        <div class="progress-label">
          <span>Progreso de la Ruta</span>
          <span>{{ animationProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width]="animationProgress + '%'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .route-animation-container {
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      height: 100%;
    }

    .route-animation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .route-animation-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .route-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .route-ports {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .port-label {
      color: #64748b;
    }

    .port-value {
      font-weight: 600;
      color: #0f172a;
    }

    .route-separator {
      color: #0a6cbc;
      font-weight: 600;
    }

    .route-distance {
      font-size: 0.875rem;
    }

    .distance-label {
      color: #64748b;
      margin-right: 0.5rem;
    }

    .distance-value {
      font-weight: 600;
      color: #0a6cbc;
    }

    .animation-controls {
      display: flex;
      gap: 0.5rem;
    }

    .control-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #475569;

      &:hover:not(:disabled) {
        background-color: #f8fafc;
        border-color: #cbd5e1;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      svg {
        flex-shrink: 0;
      }
    }

    .close-btn {
      color: #ef4444;
      &:hover {
        background-color: #fef2f2;
        border-color: #fecaca;
      }
    }

    .route-warnings {
      display: flex;
      padding: 0.75rem 1.5rem;
      background-color: #fffbeb;
      border-bottom: 1px solid #fef3c7;
      gap: 0.75rem;
    }

    .warning-icon {
      color: #f59e0b;
      flex-shrink: 0;
    }

    .warning-messages {
      font-size: 0.875rem;
      color: #92400e;

      p {
        margin: 0.25rem 0;
      }
    }

    .route-animation-map {
      flex: 1;
      min-height: 400px;
    }

    .animation-progress {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 0.5rem;
      background-color: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #0a6cbc;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    @media (max-width: 768px) {
      .route-animation-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .animation-controls {
        width: 100%;
        justify-content: space-between;
      }
    }
  `,
  ],
})
export class RouteAnimationComponent implements OnInit, OnDestroy {
  @Input() startPortId = ""
  @Input() endPortId = ""
  @Input() routeData: RouteCalculationResource | null = null
  @Output() close = new EventEmitter<void>()

  private map!: L.Map
  private routePath!: L.Polyline
  private shipMarker!: L.Marker
  private portMarkers: L.Marker[] = []
  private animationInterval: any
  private routeCoordinates: L.LatLng[] = []
  private currentPointIndex = 0
  private subscriptions: Subscription = new Subscription()

  startPortName = ""
  endPortName = ""
  isAnimating = false
  hasAnimated = false
  animationProgress = 0

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    this.initMap()
    this.loadPortDetails()
  }

  ngOnDestroy(): void {
    this.clearAnimation()
    if (this.map) {
      this.map.remove()
    }
    this.subscriptions.unsubscribe()
  }

  private initMap(): void {
    // Inicializar el mapa con Leaflet
    this.map = L.map("route-animation-map", {
      center: [20, 0], // Centro inicial del mapa (aproximadamente el centro del mundo)
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
    })

    // Añadir capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map)

    // Añadir estilos para los marcadores
    this.addMapMarkerStyles()

    // Si ya tenemos datos de ruta, procesarlos
    if (this.routeData) {
      this.processRouteData()
    }
  }

  private loadPortDetails(): void {
    if (!this.startPortId || !this.endPortId) return

    // Cargar detalles del puerto de origen
    const startPortSub = this.portService.getPortById(this.startPortId).subscribe({
      next: (port) => {
        if (port) {
          this.startPortName = port.name
          this.addPortMarker(port, "origin")
        }
      },
      error: (err) => console.error("Error al cargar puerto de origen:", err),
    })

    // Cargar detalles del puerto de destino
    const endPortSub = this.portService.getPortById(this.endPortId).subscribe({
      next: (port) => {
        if (port) {
          this.endPortName = port.name
          this.addPortMarker(port, "destination")
        }
      },
      error: (err) => console.error("Error al cargar puerto de destino:", err),
    })

    this.subscriptions.add(startPortSub)
    this.subscriptions.add(endPortSub)
  }

  private addPortMarker(port: Port, type: "origin" | "destination"): void {
    if (!this.map) return

    // Crear icono personalizado para el puerto
    const portIcon = L.divIcon({
      className: "port-marker",
      html: `<div class="port-icon port-${type}" title="${port.name}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    // Crear marcador y añadirlo al mapa
    const marker = L.marker([port.coordinates.latitude, port.coordinates.longitude], {
      icon: portIcon,
      title: port.name,
    })
      .addTo(this.map)
      .bindPopup(`
        <div class="port-popup">
          <h4>${port.name}</h4>
          <p>Continente: ${port.continent || "Desconocido"}</p>
          <p>Tipo: ${type === "origin" ? "Puerto de Origen" : "Puerto de Destino"}</p>
        </div>
      `)

    // Guardar referencia al marcador
    this.portMarkers.push(marker)

    // Si ambos puertos están cargados, ajustar la vista del mapa
    if (this.portMarkers.length === 2) {
      const group = new L.FeatureGroup(this.portMarkers)
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] })
    }
  }

  processRouteData(): void {
    if (!this.routeData || !this.map) return

    // Limpiar ruta anterior si existe
    if (this.routePath) {
      this.map.removeLayer(this.routePath)
    }

    // Convertir los puntos de la ruta a coordenadas
    this.routeCoordinates = this.convertRouteToCoordinates(this.routeData.optimalRoute)

    // Dibujar la ruta completa
    this.routePath = L.polyline(this.routeCoordinates, {
      color: "#0a6cbc",
      weight: 3,
      opacity: 0.7,
      dashArray: "5, 10",
    }).addTo(this.map)

    // Crear el marcador del barco (inicialmente en el primer punto)
    if (this.routeCoordinates.length > 0) {
      // Eliminar marcador anterior si existe
      if (this.shipMarker) {
        this.map.removeLayer(this.shipMarker)
      }

      // Crear icono personalizado para el barco
      const shipIcon = L.divIcon({
        className: "ship-marker",
        html: `<div class="ship-icon" title="Barco"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      // Crear marcador y añadirlo al mapa
      this.shipMarker = L.marker(this.routeCoordinates[0], {
        icon: shipIcon,
        title: "Barco en ruta",
      }).addTo(this.map)

      // Ajustar la vista del mapa para mostrar toda la ruta
      this.map.fitBounds(this.routePath.getBounds(), { padding: [50, 50] })
    }

    // Reiniciar variables de animación
    this.currentPointIndex = 0
    this.animationProgress = 0
    this.hasAnimated = false
  }

  private convertRouteToCoordinates(route: string[]): L.LatLng[] {
    // Convertir los puntos de la ruta (que vienen como strings) a coordenadas
    // Asumimos que cada punto viene en formato "lat,lng"
    return route.map((point) => {
      const [lat, lng] = point.split(",").map(Number)
      return L.latLng(lat, lng)
    })
  }

  startAnimation(): void {
    if (this.isAnimating || !this.routeCoordinates.length) return

    this.isAnimating = true
    this.currentPointIndex = 0
    this.animationProgress = 0

    // Mover el barco al inicio de la ruta
    if (this.shipMarker && this.routeCoordinates.length > 0) {
      this.shipMarker.setLatLng(this.routeCoordinates[0])
    }

    // Iniciar la animación
    this.animationInterval = setInterval(() => {
      this.animateNextStep()
    }, 200) // Ajustar velocidad según necesidad
  }

  private animateNextStep(): void {
    if (!this.routeCoordinates.length) return

    this.currentPointIndex++

    // Calcular progreso
    this.animationProgress = Math.round((this.currentPointIndex / (this.routeCoordinates.length - 1)) * 100)

    // Si llegamos al final, detener la animación
    if (this.currentPointIndex >= this.routeCoordinates.length) {
      this.clearAnimation()
      this.hasAnimated = true
      return
    }

    // Mover el barco a la siguiente posición
    if (this.shipMarker) {
      const nextPoint = this.routeCoordinates[this.currentPointIndex]
      this.shipMarker.setLatLng(nextPoint)

      // Opcional: rotar el icono del barco según la dirección
      if (this.currentPointIndex > 0) {
        const prevPoint = this.routeCoordinates[this.currentPointIndex - 1]
        const angle = this.calculateBearing(prevPoint, nextPoint)
        this.rotateShipIcon(angle)
      }

      // Centrar el mapa en el barco
      this.map.panTo(nextPoint)
    }
  }

  private calculateBearing(start: L.LatLng, end: L.LatLng): number {
    const startLat = (start.lat * Math.PI) / 180
    const startLng = (start.lng * Math.PI) / 180
    const endLat = (end.lat * Math.PI) / 180
    const endLng = (end.lng * Math.PI) / 180

    const dLng = endLng - startLng

    const y = Math.sin(dLng) * Math.cos(endLat)
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng)

    let bearing = (Math.atan2(y, x) * 180) / Math.PI
    bearing = (bearing + 360) % 360 // Normalizar a 0-360

    return bearing
  }

  private rotateShipIcon(angle: number): void {
    // Implementar rotación del icono del barco
    const shipIconElement = document.querySelector(".ship-icon") as HTMLElement
    if (shipIconElement) {
      shipIconElement.style.transform = `rotate(${angle}deg)`
    }
  }

  resetAnimation(): void {
    this.clearAnimation()
    this.currentPointIndex = 0
    this.animationProgress = 0

    // Mover el barco al inicio de la ruta
    if (this.shipMarker && this.routeCoordinates.length > 0) {
      this.shipMarker.setLatLng(this.routeCoordinates[0])
    }

    // Ajustar la vista del mapa
    if (this.routePath) {
      this.map.fitBounds(this.routePath.getBounds(), { padding: [50, 50] })
    }
  }

  private clearAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
      this.animationInterval = null
    }
    this.isAnimating = false
  }

  closeAnimation(): void {
    this.clearAnimation()
    this.close.emit()
  }

  private addMapMarkerStyles(): void {
    // Añadir estilos CSS para los marcadores
    const style = document.createElement("style")
    style.textContent = `
      .ship-icon {
        width: 24px;
        height: 24px;
        background-color: #ea4335;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
        transition: transform 0.2s ease;
      }

      .port-icon {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
      }

      .port-origin {
        background-color: #0a6cbc;
      }

      .port-destination {
        background-color: #00c853;
      }

      .port-popup h4 {
        margin: 0 0 5px 0;
        color: #2c3e50;
      }

      .port-popup p {
        margin: 3px 0;
        font-size: 12px;
        color: #5f6368;
      }
    `
    document.head.appendChild(style)
  }
}
