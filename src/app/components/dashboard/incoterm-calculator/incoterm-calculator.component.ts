import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IncotermService, IncotermFormData, IncotermCalculationResult } from "../../../services/incoterm.service"

@Component({
  selector: "app-incoterm-calculator",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incoterm-calculator">
      <div class="card-header">
        <h2>Calculadora de Incoterms</h2>
        <div class="card-actions">
          <button class="btn-outline" (click)="onCancel()">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cerrar
          </button>
        </div>
      </div>

      <div class="incoterm-content">
        <!-- Información de la ruta -->
        <div class="route-info">
          <div class="info-item">
            <strong>Puerto de Origen:</strong> {{ originPort }}
          </div>
          <div class="info-item">
            <strong>Puerto de Destino:</strong> {{ destinationPort }}
          </div>
          <div class="info-item">
            <strong>Distancia:</strong> {{ distance | number:'1.0-0' }} millas náuticas
          </div>
        </div>

        <!-- Formulario de Incoterms -->
        <div *ngIf="!calculationResult" class="incoterm-form">
          <h3>Información de la Mercancía</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="cargoType">Tipo de Mercancía</label>
              <select id="cargoType" [(ngModel)]="formData.cargoType" class="form-control">
                <option value="">Seleccione un tipo</option>
                <option value="general">Carga General</option>
                <option value="container">Contenedores</option>
                <option value="bulk">Carga a Granel</option>
                <option value="liquid">Líquidos</option>
                <option value="refrigerated">Refrigerada</option>
                <option value="dangerous">Mercancía Peligrosa</option>
              </select>
            </div>
            <div class="form-group">
              <label for="cargoValue">Valor de la Mercancía (USD)</label>
              <input
                type="number"
                id="cargoValue"
                [(ngModel)]="formData.cargoValue"
                class="form-control"
                placeholder="Ej: 50000"
              />
            </div>
            <div class="form-group">
              <label for="cargoWeight">Peso (kg)</label>
              <input
                type="number"
                id="cargoWeight"
                [(ngModel)]="formData.cargoWeight"
                class="form-control"
                placeholder="Ej: 5000"
              />
            </div>
            <div class="form-group">
              <label for="cargoVolume">Volumen (m³)</label>
              <input
                type="number"
                id="cargoVolume"
                [(ngModel)]="formData.cargoVolume"
                class="form-control"
                placeholder="Ej: 20"
              />
            </div>
          </div>

          <h3>Información Comercial</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="seller">Vendedor</label>
              <input
                type="text"
                id="seller"
                [(ngModel)]="formData.seller"
                class="form-control"
                placeholder="Nombre del vendedor"
              />
            </div>
            <div class="form-group">
              <label for="buyer">Comprador</label>
              <input
                type="text"
                id="buyer"
                [(ngModel)]="formData.buyer"
                class="form-control"
                placeholder="Nombre del comprador"
              />
            </div>
            <div class="form-group">
              <label for="sellerCountry">País del Vendedor</label>
              <input
                type="text"
                id="sellerCountry"
                [(ngModel)]="formData.sellerCountry"
                class="form-control"
                placeholder="País de origen"
              />
            </div>
            <div class="form-group">
              <label for="buyerCountry">País del Comprador</label>
              <input
                type="text"
                id="buyerCountry"
                [(ngModel)]="formData.buyerCountry"
                class="form-control"
                placeholder="País de destino"
              />
            </div>
          </div>

          <h3>Configuración Adicional</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="paymentTerms">Términos de Pago</label>
              <select id="paymentTerms" [(ngModel)]="formData.paymentTerms" class="form-control">
                <option value="">Seleccione una opción</option>
                <option value="prepago">Prepago</option>
                <option value="carta_credito">Carta de Crédito</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
            <div class="form-group">
              <label for="experienceLevel">Nivel de Experiencia</label>
              <select id="experienceLevel" [(ngModel)]="formData.experienceLevel" class="form-control">
                <option value="">Seleccione una opción</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.insurance" />
                Requiere seguro de carga
              </label>
            </div>
            <div class="form-group">
              <label for="specialRequirements">Requisitos Especiales</label>
              <textarea
                id="specialRequirements"
                [(ngModel)]="formData.specialRequirements"
                class="form-control"
                placeholder="Requisitos especiales para la carga"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-outline" (click)="onCancel()">Cancelar</button>
            <button class="btn-primary" [disabled]="!isFormValid()" (click)="calculateIncoterms()">
              <svg
                *ngIf="isCalculating"
                class="spinner"
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
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              {{ isCalculating ? 'Calculando...' : 'Calcular Incoterms' }}
            </button>
          </div>
        </div>

        <!-- Resultados del cálculo -->
        <div *ngIf="calculationResult" class="calculation-results">
          <div class="result-section">
            <h3>Incoterm Recomendado</h3>
            <div class="incoterm-card recommended">
              <div class="incoterm-header">
                <div class="incoterm-code">{{ calculationResult.recommendedIncoterm.code }}</div>
                <div class="incoterm-name">{{ calculationResult.recommendedIncoterm.name }}</div>
                <div class="recommendation-score">
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      [style.width.%]="calculationResult.recommendedIncoterm.recommendationScore"
                    ></div>
                  </div>
                  <span>{{ calculationResult.recommendedIncoterm.recommendationScore }}% compatible</span>
                </div>
              </div>
              <p class="incoterm-description">
                {{ calculationResult.recommendedIncoterm.description }}
              </p>
              <div class="responsibilities-grid">
                <div class="seller-responsibilities">
                  <h4>Responsabilidades del Vendedor</h4>
                  <ul>
                    <li *ngFor="let resp of calculationResult.recommendedIncoterm.sellerResponsibilities">
                      {{ resp }}
                    </li>
                  </ul>
                </div>
                <div class="buyer-responsibilities">
                  <h4>Responsabilidades del Comprador</h4>
                  <ul>
                    <li *ngFor="let resp of calculationResult.recommendedIncoterm.buyerResponsibilities">
                      {{ resp }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="cost-breakdown">
                <h4>Desglose de Costos (USD)</h4>
                <div class="cost-grid">
                  <div class="cost-item">
                    <span>Flete:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.freight | number }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Seguro:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.insurance | number }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Despacho Aduanero:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.customsClearance | number }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Manejo en Puerto:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.portHandling | number }}</span>
                  </div>
                  <div class="cost-item">
                    <span>Documentación:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.documentation | number }}</span>
                  </div>
                  <div class="cost-item total">
                    <span>Total:</span>
                    <span>{{ calculationResult.recommendedIncoterm.costBreakdown.total | number }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="result-section">
            <h3>Alternativas</h3>
            <div class="alternatives-grid">
              <div class="incoterm-card alternative" *ngFor="let alt of calculationResult.alternatives">
                <div class="incoterm-header">
                  <div class="incoterm-code">{{ alt.code }}</div>
                  <div class="incoterm-name">{{ alt.name }}</div>
                  <div class="recommendation-score">
                    <div class="score-bar">
                      <div class="score-fill" [style.width.%]="alt.recommendationScore"></div>
                    </div>
                    <span>{{ alt.recommendationScore }}% compatible</span>
                  </div>
                </div>
                <p class="incoterm-description">
                  {{ alt.description }}
                </p>
                <div class="cost-breakdown">
                  <h4>Costos Totales</h4>
                  <div class="cost-total">{{ alt.costBreakdown.total | number }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="result-section">
            <h3>Detalles de la Ruta</h3>
            <div class="route-details">
              <div class="detail-item">
                <span>Distancia:</span>
                <span>{{ calculationResult.routeDetails.distance | number:'1.0-0' }} millas náuticas</span>
              </div>
              <div class="detail-item">
                <span>Tiempo Estimado:</span>
                <span>{{ calculationResult.routeDetails.estimatedTime }}</span>
              </div>
              <div class="detail-item">
                <span>Nivel de Riesgo:</span>
                <span
                  [class.risk-low]="calculationResult.routeDetails.riskLevel === 'Bajo'"
                  [class.risk-medium]="calculationResult.routeDetails.riskLevel === 'Medio'"
                  [class.risk-high]="calculationResult.routeDetails.riskLevel === 'Alto'"
                >
                  {{ calculationResult.routeDetails.riskLevel }}
                </span>
              </div>
            </div>
          </div>

          <div class="result-section" *ngIf="calculationResult.warnings.length > 0">
            <h3>Advertencias</h3>
            <div class="warnings">
              <div class="warning-item" *ngFor="let warning of calculationResult.warnings">
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
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                {{ warning }}
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-outline" (click)="resetCalculation()">Volver al Formulario</button>
            <button class="btn-primary" (click)="createReport()">
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
                class="mr-2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Crear Informe
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .incoterm-calculator {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        margin-top: 1.5rem;
        animation: fadeIn 300ms ease;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
        }
      }

      .card-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .incoterm-content {
        padding: 1.5rem;
      }

      .route-info {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
        background-color: #f8fafc;
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
        border: 1px solid #e2e8f0;
      }

      .info-item {
        flex: 1;
        min-width: 200px;
        font-size: 0.875rem;

        strong {
          color: #0f172a;
        }
      }

      .incoterm-form h3 {
        margin: 1.5rem 0 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
      }

      .incoterm-form h3:first-child {
        margin-top: 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-group label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
      }

      .form-control {
        padding: 0.5rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        outline: none;
        transition: border-color 150ms ease;

        &:focus {
          border-color: #0a6cbc;
          box-shadow: 0 0 0 1px rgba(10, 108, 188, 0.2);
        }
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        margin-top: 1.5rem;

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
      }

      .btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background-color: transparent;
        color: #475569;
        border: 1px solid #cbd5e1;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;

        &:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }

        svg {
          flex-shrink: 0;
        }
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

        &:hover {
          background-color: #084e88;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        svg {
          flex-shrink: 0;
        }
      }

      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .mr-2 {
        margin-right: 0.5rem;
      }

      /* Estilos para los resultados */
      .calculation-results {
        animation: fadeIn 300ms ease;
      }

      .result-section {
        margin-bottom: 2rem;

        h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
      }

      .incoterm-card {
        background-color: #f8fafc;
        border-radius: 0.5rem;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        margin-bottom: 1rem;

        &.recommended {
          background-color: #f0f9ff;
          border-color: #bae6fd;
        }
      }

      .incoterm-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .incoterm-code {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0a6cbc;
      }

      .incoterm-name {
        font-size: 1rem;
        font-weight: 500;
        color: #0f172a;
      }

      .recommendation-score {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;

        span {
          font-size: 0.75rem;
          color: #475569;
        }
      }

      .score-bar {
        width: 100px;
        height: 6px;
        background-color: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }

      .score-fill {
        height: 100%;
        background-color: #0a6cbc;
        border-radius: 3px;
      }

      .incoterm-description {
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
        color: #475569;
      }

      .responsibilities-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        h4 {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
        }

        ul {
          margin: 0;
          padding-left: 1.5rem;
          font-size: 0.875rem;
          color: #475569;

          li {
            margin-bottom: 0.25rem;
          }
        }
      }

      .cost-breakdown {
        h4 {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
        }
      }

      .cost-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
      }

      .cost-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        padding: 0.5rem;
        border-radius: 0.25rem;

        &:nth-child(odd) {
          background-color: rgba(226, 232, 240, 0.3);
        }

        &.total {
          font-weight: 600;
          color: #0f172a;
          border-top: 1px solid #cbd5e1;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
        }
      }

      .alternatives-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;

        .incoterm-card {
          margin-bottom: 0;
        }

        .cost-total {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a6cbc;
          text-align: center;
          padding: 0.5rem;
          background-color: rgba(10, 108, 188, 0.1);
          border-radius: 0.25rem;
        }
      }

      .route-details {
        background-color: #f8fafc;
        border-radius: 0.5rem;
        padding: 1rem;
        border: 1px solid #e2e8f0;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        font-size: 0.875rem;
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          border-bottom: none;
        }

        .risk-low {
          color: #16a34a;
          font-weight: 500;
        }

        .risk-medium {
          color: #ca8a04;
          font-weight: 500;
        }

        .risk-high {
          color: #dc2626;
          font-weight: 500;
        }
      }

      .warnings {
        background-color: #fff9db;
        border: 1px solid #fef3c7;
        border-radius: 0.5rem;
        padding: 1rem;
      }

      .warning-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        font-size: 0.875rem;
        color: #854d0e;

        svg {
          color: #ca8a04;
          flex-shrink: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class IncotermCalculatorComponent implements OnInit {
  @Input() originPort = ""
  @Input() destinationPort = ""
  @Input() distance = 0
  @Output() cancel = new EventEmitter<void>()
  @Output() calculationComplete = new EventEmitter<IncotermCalculationResult>()
  @Output() reportCreated = new EventEmitter<void>()

  formData: IncotermFormData = {
    cargoType: "",
    cargoValue: 0,
    cargoWeight: 0,
    cargoVolume: 0,
    seller: "",
    buyer: "",
    sellerCountry: "",
    buyerCountry: "",
    paymentTerms: "",
    experienceLevel: "",
    insurance: false,
    specialRequirements: "",
  }

  isCalculating = false
  calculationResult: IncotermCalculationResult | null = null
  showSuccessMessage = false

  constructor(private incotermService: IncotermService) {}

  ngOnInit(): void {
    // Inicializar con valores predeterminados si es necesario
  }

  isFormValid(): boolean {
    return (
      !!this.formData.cargoType &&
      this.formData.cargoValue > 0 &&
      this.formData.cargoWeight > 0 &&
      !!this.formData.seller &&
      !!this.formData.buyer &&
      !!this.formData.sellerCountry &&
      !!this.formData.buyerCountry &&
      !!this.formData.paymentTerms &&
      !!this.formData.experienceLevel
    )
  }

  calculateIncoterms(): void {
    if (!this.isFormValid()) return

    this.isCalculating = true

    this.incotermService
      .calculateIncoterms(this.formData, this.originPort, this.destinationPort, this.distance)
      .subscribe({
        next: (result) => {
          this.calculationResult = result
          this.calculationComplete.emit(result)
          this.isCalculating = false
        },
        error: (error) => {
          console.error("Error al calcular Incoterms:", error)
          this.isCalculating = false
        },
      })
  }

  resetCalculation(): void {
    this.calculationResult = null
  }

  createReport(): void {
    // Simulamos la creación de un informe
    setTimeout(() => {
      this.showSuccessMessage = true
      this.reportCreated.emit()

      // Mostramos mensaje de éxito
      alert("Informe creado con éxito. Puede consultarlo en la sección de Informes.")

      // Cerramos el componente después de un breve retraso
      setTimeout(() => {
        this.onCancel()
      }, 1500)
    }, 1000)
  }

  onCancel(): void {
    this.cancel.emit()
  }
}
