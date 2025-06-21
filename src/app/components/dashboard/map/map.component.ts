import { Component, type OnInit, type AfterViewInit, type ElementRef, ViewChild, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import * as L from "leaflet"
import  { PortService, Port } from "../../../services/port.service"

@Component({
  selector: "app-map",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container scale-in">
      <div class="map-header">
        <h3>Mapa de Puertos Marítimos</h3>
        <div class="map-controls">
          <button class="map-btn" (click)="zoomIn()">Zoom In</button>
          <button class="map-btn" (click)="zoomOut()">Zoom Out</button>
          <button class="map-btn" (click)="resetView()">Reset</button>
        </div>
      </div>
      <div id="map" class="map-canvas"></div>
    </div>
  `,
  styles: [
    `
    .map-container {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;

      h3 {
        margin: 0;
        color: #2c3e50;
      }

      .map-controls {
        display: flex;
        gap: 0.5rem;
      }

      .map-btn {
        padding: 0.25rem 0.5rem;
        background-color: #f1f3f4;
        border: none;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;

        &:hover {
          background-color: #e8eaed;
        }
      }
    }

    .map-canvas {
      height: 400px;
      width: 100%;
    }
  `,
  ],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map
  private ports: Port[] = []
  private portMarkers: L.Marker[] = []
  private defaultCenter: L.LatLngExpression = [20, 0] // Centro del mapa (aproximadamente el centro del mundo)
  private defaultZoom = 2

  @ViewChild("mapCanvas") mapCanvas!: ElementRef

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    // Cargar los puertos para mostrarlos en el mapa
    this.loadPorts()
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private initMap(): void {
    // Crear el mapa
    this.map = L.map("map", {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true, // Permite que el mapa se repita horizontalmente
    })

    // Añadir la capa de mapa base (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map)

    // Añadir los puertos al mapa si ya están cargados
    if (this.ports.length > 0) {
      this.addPortsToMap()
    }
  }

  private loadPorts(): void {
    this.portService.getAllPorts().subscribe({
      next: (ports) => {
        this.ports = ports
        console.log("Puertos cargados para el mapa:", ports)

        // Si el mapa ya está inicializado, añadir los puertos
        if (this.map) {
          this.addPortsToMap()
        }
      },
      error: (err) => {
        console.error("Error al cargar puertos para el mapa:", err)
      },
    })
  }

  private addPortsToMap(): void {
    // Limpiar marcadores existentes
    this.clearPortMarkers()

    // Añadir marcadores para cada puerto
    this.ports.forEach((port) => {
      // Crear icono personalizado para el puerto
      const portIcon = L.divIcon({
        className: "port-marker",
        html: `<div class="port-icon" title="${port.name}"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      // Crear marcador y añadirlo al mapa
      const marker = L.marker([port.coordinates.latitude, port.coordinates.longitude], { icon: portIcon })
        .addTo(this.map)
        .bindPopup(`
        <div class="port-popup">
          <h4>${port.name}</h4>
          <p>Continente: ${port.continent || "Desconocido"}</p>
          <p>Coordenadas: ${port.coordinates.latitude.toFixed(4)}, ${port.coordinates.longitude.toFixed(4)}</p>
        </div>
      `)

      // Guardar referencia al marcador
      this.portMarkers.push(marker)
    })

    // Añadir estilos para los marcadores de puertos
    this.addPortMarkerStyles()
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

  private addPortMarkerStyles(): void {
    // Añadir estilos CSS para los marcadores de puertos
    const style = document.createElement("style")
    style.textContent = `
      .port-icon {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #1a73e8;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
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

  // Métodos para los controles del mapa
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn()
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut()
    }
  }

  resetView(): void {
    if (this.map) {
      this.map.setView(this.defaultCenter, this.defaultZoom)
    }
  }

  drawMap(): void {
    try {
      const canvasElement = this.mapCanvas.nativeElement

      // Verificar si el elemento es un canvas
      if (!(canvasElement instanceof HTMLCanvasElement)) {
        console.log("Creando un elemento canvas")
        // Si no es un canvas, crear uno y añadirlo al contenedor
        const canvas = document.createElement("canvas")
        canvas.width = canvasElement.offsetWidth
        canvas.height = canvasElement.offsetHeight
        canvasElement.appendChild(canvas)

        // Usar el canvas creado
        const ctx = canvas.getContext("2d")
        if (ctx) {
          this.drawMapContent(ctx, canvas.width, canvas.height)
        } else {
          console.error("No se pudo obtener el contexto 2D del canvas")
        }
      } else {
        // Si ya es un canvas, usarlo directamente
        canvasElement.width = canvasElement.offsetWidth
        canvasElement.height = canvasElement.offsetHeight
        const ctx = canvasElement.getContext("2d")
        if (ctx) {
          this.drawMapContent(ctx, canvasElement.width, canvasElement.height)
        } else {
          console.error("No se pudo obtener el contexto 2D del canvas")
        }
      }
    } catch (error) {
      console.error("Error al dibujar el mapa:", error)
      // Mostrar un mapa alternativo o un mensaje de error
      this.showFallbackMap()
    }
  }

  drawMapContent(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Dibujar un mapa simplificado
    ctx.beginPath()
    ctx.strokeStyle = "#2c3e50"
    ctx.lineWidth = 1

    // Dibujar algunas líneas de ruta
    ctx.beginPath()
    ctx.strokeStyle = "#1a73e8"
    ctx.lineWidth = 2
    ctx.moveTo(100, 150)
    ctx.bezierCurveTo(200, 100, 300, 200, 400, 150)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = "#34a853"
    ctx.lineWidth = 2
    ctx.moveTo(150, 250)
    ctx.bezierCurveTo(250, 200, 350, 300, 450, 250)
    ctx.stroke()

    // Dibujar iconos de barco
    this.drawShip(ctx, 100, 150, "#1a73e8")
    this.drawShip(ctx, 400, 150, "#1a73e8")
    this.drawShip(ctx, 150, 250, "#34a853")
    this.drawShip(ctx, 450, 250, "#34a853")
  }

  drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  showFallbackMap(): void {
    // Mostrar un mapa alternativo o un mensaje de error
    const container = this.mapCanvas.nativeElement
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: #f8f9fa;">
        <div style="text-align: center; padding: 20px;">
          <p style="margin: 0; color: #5f6368;">No se pudo cargar el mapa</p>
          <button
            style="margin-top: 10px; padding: 5px 10px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;"
            onclick="this.parentNode.parentNode.parentNode.dispatchEvent(new CustomEvent('retry'))">
            Reintentar
          </button>
        </div>
      </div>
    `

    // Añadir un event listener para reintentar
    container.addEventListener("retry", () => {
      this.drawMap()
    })
  }
}
