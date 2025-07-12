import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup } from "@angular/forms"
import { ReportService, RouteHistoryItem } from "../../../services/report.service"
import { SidebarComponent } from "../../shared/sidebar/sidebar.component"
import { HeaderComponent } from "../../shared/header/header.component"

@Component({
  selector: "app-route-history",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <app-sidebar [currentUser]="currentUser"></app-sidebar>

      <div class="main-content">
        <app-header
          pageTitle="Historial de Rutas"
          [notificationCount]="2"
        >
          <button class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar Historial
          </button>
        </app-header>

        <main class="reports-content">
          <div class="filters-container">
            <h2>Filtros</h2>
            <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
              <div class="filter-row">
                <div class="filter-group">
                  <label for="startDate">Fecha Inicio</label>
                  <input
                    type="date"
                    id="startDate"
                    formControlName="startDate"
                    class="filter-input"
                  >
                </div>
                <div class="filter-group">
                  <label for="endDate">Fecha Fin</label>
                  <input
                    type="date"
                    id="endDate"
                    formControlName="endDate"
                    class="filter-input"
                  >
                </div>
              </div>
              <div class="filter-row">
                <div class="filter-group">
                  <label for="destination">Destino</label>
                  <input
                    type="text"
                    id="destination"
                    formControlName="destination"
                    placeholder="Nombre del puerto de destino"
                    class="filter-input"
                  >
                </div>
                <div class="filter-group">
                  <label for="vessel">Embarcación</label>
                  <input
                    type="text"
                    id="vessel"
                    formControlName="vessel"
                    placeholder="Nombre de la embarcación"
                    class="filter-input"
                  >
                </div>
              </div>
              <div class="filter-actions">
                <button type="button" class="reset-btn" (click)="resetFilters()">Restablecer</button>
                <button type="submit" class="apply-btn">Aplicar Filtros</button>
              </div>
            </form>
          </div>

          <div class="results-container">
            <div class="results-header">
              <h2>Resultados</h2>
              <div class="results-count" *ngIf="!loading">
                {{ routeHistory.length }} rutas encontradas
              </div>
            </div>

            <div class="loading-container" *ngIf="loading">
              <div class="spinner"></div>
              <span>Cargando historial...</span>
            </div>

            <div class="no-results" *ngIf="!loading && routeHistory.length === 0">
              No se encontraron rutas que coincidan con los filtros aplicados.
            </div>

            <div class="results-table-container" *ngIf="!loading && routeHistory.length > 0">
              <table class="results-table">
                <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Fecha Salida</th>
                  <th>Fecha Llegada</th>
                  <th>Embarcación</th>
                  <th>Distancia</th>
                  <th>Emisiones</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let route of routeHistory">
                  <td>{{ route.routeName }}</td>
                  <td>{{ route.originPort }}</td>
                  <td>{{ route.destinationPort }}</td>
                  <td>{{ formatDate(route.departureDate) }}</td>
                  <td>{{ formatDate(route.arrivalDate) }}</td>
                  <td>{{ route.vessel }}</td>
                  <td>{{ route.distance }}</td>
                  <td>{{ route.emissions }}</td>
                </tr>
                </tbody>
              </table>
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

      .reports-content {
        padding: 2rem;
        padding-top: calc(70px + 2rem);
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

        svg {
          flex-shrink: 0;
        }
      }

      .mr-2 {
        margin-right: 0.5rem;
      }

      .history-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: #f5f7fa;
      }

      .history-header {
        background-color: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        max-width: 1400px;
        margin: 0 auto;
      }

      .history-header h1 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.8rem;
      }

      .breadcrumbs {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #5f6368;
      }

      .breadcrumbs a {
        color: #1a73e8;
        text-decoration: none;
      }

      .breadcrumbs a:hover {
        text-decoration: underline;
      }

      .history-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 1.5rem;
        gap: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
      }

      .filters-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .filters-container h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #2c3e50;
      }

      .filter-row {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1rem;
      }

      .filter-group {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .filter-group label {
        font-size: 0.9rem;
        color: #5f6368;
        margin-bottom: 0.5rem;
      }

      .filter-input {
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      .filter-input:focus {
        outline: none;
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
      }

      .filter-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
      }

      .reset-btn {
        padding: 0.75rem 1.5rem;
        background-color: #f1f3f4;
        color: #5f6368;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
      }

      .reset-btn:hover {
        background-color: #e8eaed;
      }

      .apply-btn {
        padding: 0.75rem 1.5rem;
        background-color: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
      }

      .apply-btn:hover {
        background-color: #1557b0;
      }

      .results-container {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .results-header h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #2c3e50;
      }

      .results-count {
        font-size: 0.9rem;
        color: #5f6368;
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

      .no-results {
        padding: 2rem;
        text-align: center;
        color: #5f6368;
      }

      .results-table-container {
        flex: 1;
        overflow-x: auto;
      }

      .results-table {
        width: 100%;
        border-collapse: collapse;
      }

      .results-table th {
        text-align: left;
        padding: 0.75rem 1rem;
        background-color: #f8f9fa;
        color: #5f6368;
        font-weight: 500;
        font-size: 0.9rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .results-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e0e0e0;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .results-table tr:hover {
        background-color: #f1f3f4;
      }

      @media (max-width: 768px) {
        .filter-row {
          flex-direction: column;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class RouteHistoryComponent implements OnInit {
  routeHistory: RouteHistoryItem[] = []
  loading = true
  filterForm: FormGroup
  currentUser = {
    name: "Usuario Demo",
    role: "Capitán",
  }

  constructor(
    private reportService: ReportService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      startDate: [""],
      endDate: [""],
      destination: [""],
      vessel: [""],
    })
  }

  ngOnInit(): void {
    this.loadRouteHistory()
  }

  loadRouteHistory(): void {
    this.loading = true
    this.reportService.getRouteHistory().subscribe({
      next: (data) => {
        this.routeHistory = data
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar el historial de rutas:", err)
        this.loading = false
      },
    })
  }

  applyFilters(): void {
    this.loading = true
    const filters = this.filterForm.value

    // Solo incluir filtros con valores
    const activeFilters: any = {}
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        activeFilters[key] = filters[key]
      }
    })

    this.reportService.getRouteHistory(activeFilters).subscribe({
      next: (data) => {
        this.routeHistory = data
        this.loading = false
      },
      error: (err) => {
        console.error("Error al aplicar filtros:", err)
        this.loading = false
      },
    })
  }

  resetFilters(): void {
    this.filterForm.reset()
    this.loadRouteHistory()
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
}
