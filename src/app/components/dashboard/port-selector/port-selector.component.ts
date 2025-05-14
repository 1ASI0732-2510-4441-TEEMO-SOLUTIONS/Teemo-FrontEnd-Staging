import { Component, type OnInit, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { PortService, Port } from "../../../services/port.service"

@Component({
  selector: "app-port-selector",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="port-selector-container">
      <h3>Seleccionar Puertos para la Ruta</h3>

      <div *ngIf="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>Cargando puertos...</span>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
        <button class="retry-button" (click)="loadPorts()">Reintentar</button>
      </div>

      <div *ngIf="!loading && ports.length === 0 && !error" class="info-message">
        No hay puertos disponibles. Contacte al administrador.
      </div>

      <form [formGroup]="routeForm" *ngIf="!loading && ports.length > 0 && !error">
        <div class="form-group">
          <label for="originPort">Puerto de Origen</label>
          <select
            id="originPort"
            formControlName="originPortId"
            class="form-control"
          >
            <option value="">Seleccionar puerto de origen</option>
            <option *ngFor="let port of ports" [value]="port.id">
              {{ port.name }} ({{ port.continent || 'Desconocido' }})
            </option>
          </select>
          <div class="validation-error" *ngIf="routeForm.get('originPortId')?.invalid && routeForm.get('originPortId')?.touched">
            El puerto de origen es requerido
          </div>
        </div>

        <div class="form-group">
          <label for="destinationPort">Puerto de Destino</label>
          <select
            id="destinationPort"
            formControlName="destinationPortId"
            class="form-control"
          >
            <option value="">Seleccionar puerto de destino</option>
            <option *ngFor="let port of ports" [value]="port.id">
              {{ port.name }} ({{ port.continent || 'Desconocido' }})
            </option>
          </select>
          <div class="validation-error" *ngIf="routeForm.get('destinationPortId')?.invalid && routeForm.get('destinationPortId')?.touched">
            El puerto de destino es requerido
          </div>
        </div>

        <div class="port-info" *ngIf="selectedOriginPort && selectedDestinationPort">
          <h4>Información de la Ruta</h4>
          <div class="distance-info">
            <strong>Distancia Estimada:</strong> {{ calculateDistance() | number:'1.0-0' }} millas náuticas
          </div>
          <div class="continent-info" *ngIf="isCrossContinental()">
            <strong>Nota:</strong> Esta es una ruta intercontinental ({{ selectedOriginPort.continent }} a {{ selectedDestinationPort.continent }})
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="routeForm.invalid" (click)="onSubmit()">
            Planificar Ruta
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .port-selector-container {
        background-color: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h3 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #2c3e50;
        font-size: 1.2rem;
      }

      .loading-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #5f6368;
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

      .error-message {
        padding: 0.75rem;
        background-color: rgba(234, 67, 53, 0.1);
        color: #ea4335;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .info-message {
        padding: 0.75rem;
        background-color: rgba(66, 133, 244, 0.1);
        color: #4285f4;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .retry-button {
        background-color: #ea4335;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        cursor: pointer;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
        }
      }

      .validation-error {
        color: #ea4335;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .btn-cancel {
        padding: 0.75rem 1.5rem;
        background-color: #f1f3f4;
        color: #5f6368;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;

        &:hover {
          background-color: #e8eaed;
        }
      }

      .btn-primary {
        padding: 0.75rem 1.5rem;
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;

        &:hover {
          background-color: #1557b0;
        }

        &:disabled {
          background-color: #a8c7fa;
          cursor: not-allowed;
        }
      }

      .port-info {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #1a73e8;
      }

      .port-info h4 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        color: #2c3e50;
        font-size: 1rem;
      }

      .distance-info, .continent-info {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #5f6368;
      }

      .continent-info {
        color: #fbbc05;
      }
    `,
  ],
})
export class PortSelectorComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>()
  @Output() submitRoute = new EventEmitter<any>()

  ports: Port[] = []
  routeForm: FormGroup
  loading = false
  error = ""

  selectedOriginPort: Port | null = null
  selectedDestinationPort: Port | null = null

  constructor(
    private portService: PortService,
    private fb: FormBuilder,
  ) {
    this.routeForm = this.fb.group({
      originPortId: ["", Validators.required],
      destinationPortId: ["", Validators.required],
    })

    // Escuchar cambios para actualizar los puertos seleccionados
    this.routeForm.get("originPortId")?.valueChanges.subscribe((id) => {
      this.selectedOriginPort = this.ports.find((p) => p.id === Number(id)) || null
    })

    this.routeForm.get("destinationPortId")?.valueChanges.subscribe((id) => {
      this.selectedDestinationPort = this.ports.find((p) => p.id === Number(id)) || null
    })
  }

  ngOnInit(): void {
    this.loadPorts()
  }

  loadPorts(): void {
    this.loading = true
    this.error = ""

    this.portService.getAllPorts().subscribe({
      next: (ports) => {
        this.ports = ports
        this.loading = false
        console.log("Puertos cargados:", ports)
      },
      error: (err) => {
        console.error("Error al cargar puertos:", err)

        // Mensaje de error más específico para problemas de autenticación
        if (err.status === 401) {
          this.error =
            "No se pudo acceder a los puertos. Problema de autenticación. Por favor, inicie sesión nuevamente."
        } else {
          this.error = err.message || "No se pudieron cargar los puertos. Por favor, inténtelo de nuevo más tarde."
        }

        this.loading = false
      },
    })
  }

  onCancel(): void {
    this.cancel.emit()
  }

  onSubmit(): void {
    if (this.routeForm.valid && this.selectedOriginPort && this.selectedDestinationPort) {
      const routeData = {
        originPortId: this.selectedOriginPort.id,
        originPortName: this.selectedOriginPort.name,
        destinationPortId: this.selectedDestinationPort.id,
        destinationPortName: this.selectedDestinationPort.name,
        distance: this.calculateDistance(),
        isCrossContinental: this.isCrossContinental(),
      }

      this.submitRoute.emit(routeData)
    }
  }

  calculateDistance(): number {
    if (!this.selectedOriginPort || !this.selectedDestinationPort) {
      return 0
    }

    // Fórmula de Haversine para calcular la distancia entre dos puntos en la Tierra
    const R = 3440.07 // Radio de la Tierra en millas náuticas
    const dLat = this.toRad(this.selectedDestinationPort.latitude - this.selectedOriginPort.latitude)
    const dLon = this.toRad(this.selectedDestinationPort.longitude - this.selectedOriginPort.longitude)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.selectedOriginPort.latitude)) *
      Math.cos(this.toRad(this.selectedDestinationPort.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
  }

  isCrossContinental(): boolean {
    return !!(
      this.selectedOriginPort &&
      this.selectedDestinationPort &&
      this.selectedOriginPort.continent &&
      this.selectedDestinationPort.continent &&
      this.selectedOriginPort.continent !== this.selectedDestinationPort.continent
    )
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180
  }
}
