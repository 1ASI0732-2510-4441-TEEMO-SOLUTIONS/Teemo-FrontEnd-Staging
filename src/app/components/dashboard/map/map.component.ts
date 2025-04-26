import { Component, type OnInit, type AfterViewInit, type ElementRef, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-map",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-header">
        <h3>Route Map</h3>
        <div class="map-controls">
          <button class="map-btn">Zoom In</button>
          <button class="map-btn">Zoom Out</button>
          <button class="map-btn">Reset</button>
        </div>
      </div>
      <div class="map-canvas" #mapCanvas></div>
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
      background-color: #e6f2ff;
      position: relative;
    }
  `,
  ],
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild("mapCanvas") mapCanvas!: ElementRef

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.drawMap()
  }

  drawMap(): void {
    const canvas = this.mapCanvas.nativeElement
    const ctx = canvas.getContext("2d")

    // This is a simplified map drawing
    // In a real application, you would use a mapping library like Leaflet or Google Maps

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw world map outline (simplified)
    ctx.beginPath()
    ctx.strokeStyle = "#2c3e50"
    ctx.lineWidth = 1

    // Draw some route lines
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

    // Draw ship icons
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
}
