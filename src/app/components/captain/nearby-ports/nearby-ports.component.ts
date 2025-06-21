import { Component, type OnInit, type AfterViewInit, type OnDestroy, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { NearbyPortService, NearbyPort } from "../../../services/nearby-port.service"
import  { PortService, Port } from "../../../services/port.service"
import * as L from "leaflet"
import { Subscription } from "rxjs"
import { SidebarComponent } from "../../shared/sidebar/sidebar.component"
import { HeaderComponent } from "../../shared/header/header.component"

@Component({
  selector: "app-nearby-ports",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <app-sidebar [currentUser]="currentUser"></app-sidebar>

      <div class="main-content">
        <app-header
          pageTitle="Informacion de Puertos"
          [notificationCount]="1"
        >
          <button class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
            Actualizar Ubicación
          </button>
        </app-header>

        <main class="nearby-ports-content">
          <div class="nearby-ports-grid">
            <div class="map-container">
              <div class="map-header">
                <h2>Mapa de Ubicación</h2>
                <div class="current-location" *ngIf="currentLocation">
                  <span class="location-label">Ubicación Actual:</span>
                  <span class="location-value">{{ currentLocation.latitude.toFixed(4) }}, {{ currentLocation.longitude.toFixed(4) }}</span>
                </div>
              </div>
              <div id="nearby-ports-map" class="map-canvas"></div>
            </div>

            <div class="content-container">
              <div class="ports-list-container">
                <div class="ports-list-header">
                  <h2>Puertos Cercanos</h2>
                  <div class="search-container">
                    <input
                      type="text"
                      placeholder="Buscar puerto..."
                      [(ngModel)]="searchTerm"
                      (input)="filterPorts()"
                      class="search-input"
                    >
                  </div>
                </div>

                <div class="loading-container" *ngIf="loading">
                  <div class="spinner"></div>
                  <span>Buscando puertos cercanos...</span>
                </div>

                <div class="no-ports" *ngIf="!loading && filteredPorts.length === 0">
                  No se encontraron puertos cercanos.
                </div>

                <div class="ports-list" *ngIf="!loading && filteredPorts.length > 0">
                  <div
                    class="port-item"
                    *ngFor="let port of filteredPorts"
                    [class.selected]="selectedPort?.id === port.id"
                    (click)="selectPort(port)"
                  >
                    <div class="port-header">
                      <h3 class="port-name">{{ port.name }}</h3>
                      <span class="port-status" [class.status-open]="port.status === 'open'" [class.status-closed]="port.status === 'closed'">
                        {{ port.status === 'open' ? 'Abierto' : 'Cerrado' }}
                      </span>
                    </div>
                    <div class="port-country">{{ port.country }}</div>
                    <div class="port-distance">{{ port.distance.toFixed(1) }} millas náuticas</div>
                  </div>
                </div>
              </div>

              <div class="port-details-container" *ngIf="selectedPort">
                <div class="port-details-header">
                  <h2>Detalles del Puerto</h2>
                </div>
                <div class="port-details-content">
                  <div class="port-detail-section">
                    <h3>Información General</h3>
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">{{ selectedPort.name }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">País:</span>
                        <span class="detail-value">{{ selectedPort.country }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value" [class.status-open]="selectedPort.status === 'open'" [class.status-closed]="selectedPort.status === 'closed'">
                          {{ selectedPort.status === 'open' ? 'Abierto' : 'Cerrado' }}
                        </span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Distancia:</span>
                        <span class="detail-value">{{ selectedPort.distance.toFixed(1) }} millas náuticas</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Profundidad Máxima:</span>
                        <span class="detail-value">{{ selectedPort.maxDepth }} metros</span>
                      </div>
                    </div>
                  </div>

                  <div class="port-detail-section">
                    <h3>Instalaciones Disponibles</h3>
                    <div class="facilities-list">
                      <div class="facility-item" *ngFor="let facility of selectedPort.facilities">
                        <div class="facility-icon" [ngClass]="'facility-' + facility.toLowerCase()"></div>
                        <div class="facility-name">{{ facility }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="port-detail-section">
                    <h3>Información de Contacto</h3>
                    <div class="contact-grid">
                      <div class="contact-item">
                        <span class="contact-label">Teléfono:</span>
                        <span class="contact-value">{{ selectedPort.contactInfo.phone }}</span>
                      </div>
                      <div class="contact-item">
                        <span class="contact-label">Email:</span>
                        <span class="contact-value">{{ selectedPort.contactInfo.email }}</span>
                      </div>
                      <div class="contact-item">
                        <span class="contact-label">Canal VHF:</span>
                        <span class="contact-value">{{ selectedPort.contactInfo.vhfChannel }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="no-port-selected" *ngIf="!selectedPort">
                <div class="no-port-message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3>Seleccione un puerto para ver sus detalles</h3>
                  <p>Haga clic en uno de los puertos de la lista para ver información detallada.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        min-height: 100vh;
        background-color: #f8fafc;
      }

      .main-content {
        flex: 1;
        margin-left: 80px;
        transition: margin-left 250ms ease;

        &.sidebar-expanded {
          margin-left: 260px;
        }
      }

      .nearby-ports-content {
        padding: 1.5rem;
        padding-top: calc(70px + 1.5rem);
        height: 100vh;
        overflow: hidden;
      }

      .nearby-ports-grid {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 1.5rem;
        height: calc(100vh - 140px);
        max-width: 1400px;
        margin: 0 auto;
      }

      .map-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: relative;
        z-index: 1;
      }

      .map-header {
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .map-header h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #2c3e50;
      }

      .current-location {
        font-size: 0.9rem;
      }

      .location-label {
        color: #5f6368;
        margin-right: 0.5rem;
      }

      .location-value {
        color: #2c3e50;
        font-weight: 500;
      }

      .map-canvas {
        flex: 1;
        min-height: 0;
        width: 100%;
        position: relative;
        z-index: 1;
      }

      .content-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        overflow: hidden;
      }

      .ports-list-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 45%;
        overflow: hidden;
      }

      .ports-list-header {
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
        flex-shrink: 0;
      }

      .ports-list-header h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #2c3e50;
      }

      .search-container {
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      .search-input:focus {
        outline: none;
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
      }

      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: #5f6368;
        gap: 0.5rem;
      }

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #1a73e8;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .no-ports {
        padding: 2rem;
        text-align: center;
        color: #5f6368;
      }

      .ports-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
        min-height: 0;
      }

      .port-item {
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
        border: 1px solid transparent;
      }

      .port-item:hover {
        background-color: #f1f3f4;
      }

      .port-item.selected {
        background-color: #e8f0fe;
        border-color: #1a73e8;
      }

      .port-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .port-name {
        margin: 0;
        font-size: 0.95rem;
        color: #2c3e50;
        font-weight: 500;
      }

      .port-status {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-weight: 500;
      }

      .status-open {
        background-color: #e6f4ea;
        color: #34a853;
      }

      .status-closed {
        background-color: #fce8e6;
        color: #ea4335;
      }

      .port-country {
        font-size: 0.85rem;
        color: #5f6368;
        margin-bottom: 0.25rem;
      }

      .port-distance {
        font-size: 0.85rem;
        color: #1a73e8;
        font-weight: 500;
      }

      .port-details-container, .no-port-selected {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        height: 55%;
        overflow: hidden;
      }

      .port-details-header {
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
        flex-shrink: 0;
      }

      .port-details-header h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #2c3e50;
      }

      .port-details-content {
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
      }

      .port-detail-section {
        margin-bottom: 1.5rem;
      }

      .port-detail-section:last-child {
        margin-bottom: 0;
      }

      .port-detail-section h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
        color: #2c3e50;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
      }

      .detail-label {
        font-size: 0.75rem;
        color: #5f6368;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        font-weight: 500;
      }

      .detail-value {
        font-size: 0.9rem;
        color: #2c3e50;
        font-weight: 500;
      }

      .facilities-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .facility-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.75rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        font-size: 0.8rem;
      }

      .facility-icon {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .facility-fuel { background-color: #fbbc05; }
      .facility-repairs { background-color: #ea4335; }
      .facility-medical { background-color: #34a853; }
      .facility-supplies { background-color: #1a73e8; }
      .facility-customs { background-color: #9c27b0; }
      .facility-security { background-color: #607d8b; }

      .facility-name {
        font-size: 0.8rem;
        color: #2c3e50;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .contact-item {
        display: flex;
        flex-direction: column;
      }

      .contact-label {
        font-size: 0.75rem;
        color: #5f6368;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        font-weight: 500;
      }

      .contact-value {
        font-size: 0.9rem;
        color: #2c3e50;
      }

      .no-port-selected {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .no-port-message {
        text-align: center;
        padding: 2rem;
        max-width: 300px;
      }

      .no-port-message svg {
        color: #dadce0;
        margin-bottom: 1rem;
      }

      .no-port-message h3 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
        font-size: 1.1rem;
      }

      .no-port-message p {
        margin: 0;
        color: #5f6368;
        font-size: 0.9rem;
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background-color: #0a6cbc;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 150ms ease;
      }

      .btn-primary:hover {
        background-color: #084e88;
      }

      .btn-primary svg {
        flex-shrink: 0;
      }

      .mr-2 {
        margin-right: 0.5rem;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .nearby-ports-grid {
          grid-template-columns: 1fr;
          grid-template-rows: 400px 1fr;
          height: calc(100vh - 120px);
        }

        .content-container {
          grid-row: 2;
          flex-direction: row;
          gap: 1rem;
        }

        .ports-list-container {
          height: 100%;
          width: 50%;
        }

        .port-details-container, .no-port-selected {
          height: 100%;
          width: 50%;
        }
      }

      @media (max-width: 768px) {
        .main-content {
          margin-left: 0;
        }

        .nearby-ports-content {
          padding: 1rem;
          padding-top: calc(70px + 1rem);
        }

        .nearby-ports-grid {
          grid-template-columns: 1fr;
          grid-template-rows: 300px auto auto;
          height: auto;
          gap: 1rem;
        }

        .content-container {
          flex-direction: column;
        }

        .ports-list-container {
          height: 400px;
          width: 100%;
        }

        .port-details-container, .no-port-selected {
          height: 400px;
          width: 100%;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NearbyPortsComponent implements OnInit, AfterViewInit, OnDestroy {
  nearbyPorts: NearbyPort[] = []
  filteredPorts: NearbyPort[] = []
  selectedPort: NearbyPort | null = null
  loading = true
  searchTerm = ""
  currentLocation: { latitude: number; longitude: number } | null = null
  private map!: L.Map
  private shipMarker!: L.Marker
  private portMarkers: L.Marker[] = []
  private subscriptions: Subscription = new Subscription()
  currentUser = {
    name: "Usuario Demo",
    role: "Capitán",
  }

  constructor(
    private nearbyPortService: NearbyPortService,
    private portService: PortService,
  ) {}

  ngOnInit(): void {
    this.getCurrentLocation()
  }

  ngAfterViewInit(): void {
    // Inicializar el mapa después de que la vista esté lista
    setTimeout(() => {
      if (this.currentLocation) {
        this.initMap()
      }
    }, 100)
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones
    this.subscriptions.unsubscribe()

    // Destruir el mapa si existe
    if (this.map) {
      this.map.remove()
    }
  }

  getCurrentLocation(): void {
    this.loading = true
    const subscription = this.nearbyPortService.getCurrentLocation().subscribe({
      next: (location) => {
        this.currentLocation = location

        // Inicializar el mapa si la vista ya está lista
        setTimeout(() => {
          this.initMap()
          this.loadNearbyPorts()
        }, 100)
      },
      error: (err) => {
        console.error("Error al obtener la ubicación actual:", err)
        // Usar una ubicación predeterminada en caso de error
        this.currentLocation = { latitude: 1.29027, longitude: 103.851959 } // Singapore

        setTimeout(() => {
          this.initMap()
          this.loadNearbyPorts()
        }, 100)
      },
    })

    this.subscriptions.add(subscription)
  }

  loadNearbyPorts(): void {
    if (!this.currentLocation) return

    this.loading = true

    // Usar el servicio de puertos mejorado para obtener todos los puertos
    const subscription = this.portService.getAllPorts().subscribe({
      next: (ports) => {
        console.log("Puertos obtenidos para nearby-ports:", ports)

        // Convertir los puertos a formato NearbyPort y calcular distancias
        this.nearbyPorts = ports.map((port) => this.convertToNearbyPort(port))

        // Ordenar por distancia
        this.nearbyPorts.sort((a, b) => a.distance - b.distance)

        this.filteredPorts = [...this.nearbyPorts]
        this.loading = false

        // Añadir puertos al mapa
        this.addPortsToMap()
      },
      error: (err) => {
        console.error("Error al cargar puertos cercanos:", err)
        this.loading = false
      },
    })

    this.subscriptions.add(subscription)
  }

  private convertToNearbyPort(port: Port): NearbyPort {
    const distance = this.calculateDistance(
      this.currentLocation!.latitude,
      this.currentLocation!.longitude,
      port.coordinates.latitude,
      port.coordinates.longitude,
    )

    return {
      id: Number(port.id), // Convertir id a número
      name: port.name,
      country: port.continent, // Usar continente como país por ahora
      latitude: port.coordinates.latitude, // Acceder a latitude desde coordinates
      longitude: port.coordinates.longitude, // Acceder a longitude desde coordinates
      distance: distance,
      status: Math.random() > 0.3 ? "open" : "closed", // Estado aleatorio para demostración
      facilities: this.getRandomFacilities(),
      maxDepth: Math.floor(Math.random() * 10) + 10, // Profundidad aleatoria entre 10-20m
      contactInfo: {
        phone: `+${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 10000)} ${Math.floor(Math.random() * 10000)}`,
        email: `port@${port.name.toLowerCase().replace(/\s/g, "")}.com`,
        vhfChannel: `${Math.floor(Math.random() * 16) + 1}`,
      },
    }
  }

  // Método para calcular la distancia entre dos puntos usando la fórmula de Haversine
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.07 // Radio de la Tierra en millas náuticas
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180
  }

  private getRandomFacilities(): string[] {
    const allFacilities = ["Fuel", "Repairs", "Medical", "Supplies", "Customs", "Security"]
    const numFacilities = Math.floor(Math.random() * 4) + 1 // 1-4 instalaciones
    const facilities: string[] = []

    for (let i = 0; i < numFacilities; i++) {
      const facility = allFacilities[Math.floor(Math.random() * allFacilities.length)]
      if (!facilities.includes(facility)) {
        facilities.push(facility)
      }
    }

    return facilities
  }

  filterPorts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPorts = [...this.nearbyPorts]
      return
    }

    const term = this.searchTerm.toLowerCase()
    this.filteredPorts = this.nearbyPorts.filter(
      (port) => port.name.toLowerCase().includes(term) || port.country.toLowerCase().includes(term),
    )
  }

  selectPort(port: NearbyPort): void {
    this.selectedPort = port

    // Centrar el mapa en el puerto seleccionado
    if (this.map) {
      this.map.setView([port.latitude, port.longitude], 10)

      // Resaltar el marcador del puerto seleccionado
      this.portMarkers.forEach((marker) => {
        const markerPort = marker.options.title
        if (markerPort === port.name) {
          marker.openPopup()
        }
      })
    }
  }

  private initMap(): void {
    if (!this.currentLocation || document.getElementById("nearby-ports-map") === null) return

    // Verificar si el mapa ya existe
    if (this.map) {
      this.map.remove()
    }

    // Crear el mapa
    this.map = L.map("nearby-ports-map", {
      center: [this.currentLocation.latitude, this.currentLocation.longitude],
      zoom: 9,
      minZoom: 2,
      maxZoom: 18,
    })

    // Añadir la capa de mapa base (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map)

    // Añadir marcador para la ubicación actual (barco)
    const shipIcon = L.divIcon({
      className: "ship-marker",
      html: `<div class="ship-icon" title="Mi Ubicación"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    this.shipMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude], {
      icon: shipIcon,
      title: "Mi Ubicación",
    })
      .addTo(this.map)
      .bindPopup("<strong>Mi Ubicación Actual</strong>")

    // Añadir estilos para el marcador del barco
    this.addMapMarkerStyles()

    // Invalidar el tamaño del mapa para asegurar que se renderice correctamente
    setTimeout(() => {
      this.map.invalidateSize()
    }, 200)
  }

  private addPortsToMap(): void {
    if (!this.map || !this.nearbyPorts.length) return

    // Limpiar marcadores existentes
    this.clearPortMarkers()

    // Añadir marcadores para cada puerto
    this.nearbyPorts.forEach((port) => {
      // Crear icono personalizado para el puerto
      const portIcon = L.divIcon({
        className: "port-marker",
        html: `<div class="port-icon ${port.status === "open" ? "port-open" : "port-closed"}" title="${port.name}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      // Crear marcador y añadirlo al mapa
      const marker = L.marker([port.latitude, port.longitude], {
        icon: portIcon,
        title: port.name,
      })
        .addTo(this.map)
        .bindPopup(`
          <div class="port-popup">
            <h4>${port.name}</h4>
            <p>País: ${port.country}</p>
            <p>Estado: ${port.status === "open" ? "Abierto" : "Cerrado"}</p>
            <p>Distancia: ${port.distance.toFixed(1)} millas náuticas</p>
          </div>
        `)

      // Guardar referencia al marcador
      this.portMarkers.push(marker)

      // Añadir evento de clic al marcador
      marker.on("click", () => {
        this.selectPort(port)
      })
    })
  }

  private clearPortMarkers(): void {
    // Eliminar todos los marcadores de puertos del mapa
    this.portMarkers.forEach((marker) => {
      if (this.map) {
        this.map.removeLayer(marker)
      }
    })
    this.portMarkers = []
  }

  private addMapMarkerStyles(): void {
    // Añadir estilos CSS para los marcadores
    const style = document.createElement("style")
    style.textContent = `
      .ship-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ea4335;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
      }
      .port-icon {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
      }
      .port-open {
        background-color: #34a853;
      }
      .port-closed {
        background-color: #ea4335;
      }
      .port-popup h4 {
      .port-open {
        background-color: #34a853;
      }
      .port-closed {
        background-color: #ea4335;
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

  @HostListener("window:resize")
  onResize() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize()
      }, 200)
    }
  }
}
