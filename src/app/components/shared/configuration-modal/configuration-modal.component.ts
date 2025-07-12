import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  {
  ConfigurationService,
  DashboardLayout,
  NotificationPreferences,
  UserProfile,
} from "../../../services/configuration.service"
import  { ThemeService, ThemeConfig } from "../../../services/theme.service"

@Component({
  selector: "app-configuration-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Configuración</h2>
          <button class="close-btn" (click)="closeModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="tabs">
            <button
              *ngFor="let tab of tabs"
              class="tab-btn"
              [class.active]="activeTab === tab.id"
              (click)="activeTab = tab.id"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="tab.icon"></path>
              </svg>
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Theme Settings -->
            <div *ngIf="activeTab === 'theme'" class="settings-section">
              <h3>Configuración de Tema</h3>

              <div class="setting-group">
                <label>Modo de Tema</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" [(ngModel)]="themeConfig.mode" value="light" (change)="updateTheme()">
                    <span>Claro</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" [(ngModel)]="themeConfig.mode" value="dark" (change)="updateTheme()">
                    <span>Oscuro</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" [(ngModel)]="themeConfig.mode" value="auto" (change)="updateTheme()">
                    <span>Automático</span>
                  </label>
                </div>
              </div>

              <div class="setting-group">
                <label for="primaryColor">Color Primario</label>
                <input type="color" id="primaryColor" [(ngModel)]="themeConfig.primaryColor" (change)="updateTheme()">
              </div>

              <div class="setting-group">
                <label for="accentColor">Color de Acento</label>
                <input type="color" id="accentColor" [(ngModel)]="themeConfig.accentColor" (change)="updateTheme()">
              </div>

              <div class="setting-group">
                <label>Tamaño de Fuente</label>
                <select [(ngModel)]="themeConfig.fontSize" (change)="updateTheme()">
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              <div class="setting-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="themeConfig.animations" (change)="updateTheme()">
                  <span>Habilitar Animaciones</span>
                </label>
              </div>

              <div class="setting-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="themeConfig.compactMode" (change)="updateTheme()">
                  <span>Modo Compacto</span>
                </label>
              </div>
            </div>

            <!-- Dashboard Layout -->
            <div *ngIf="activeTab === 'layout'" class="settings-section">
              <h3>Diseño del Dashboard</h3>

              <div class="setting-group">
                <label>Diseño de Cuadrícula</label>
                <select [(ngModel)]="dashboardLayout.gridLayout" (change)="updateDashboardLayout()">
                  <option value="compact">Compacto</option>
                  <option value="comfortable">Cómodo</option>
                  <option value="spacious">Espacioso</option>
                </select>
              </div>

              <div class="setting-group">
                <label>Posición del Mapa</label>
                <select [(ngModel)]="dashboardLayout.mapPosition" (change)="updateDashboardLayout()">
                  <option value="top">Superior</option>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
              </div>

              <div class="setting-group">
                <h4>Widgets Visibles</h4>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="dashboardLayout.showWeatherWidget" (change)="updateDashboardLayout()">
                  <span>Widget del Clima</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="dashboardLayout.showStatistics" (change)="updateDashboardLayout()">
                  <span>Estadísticas</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="dashboardLayout.showRecentRoutes" (change)="updateDashboardLayout()">
                  <span>Rutas Recientes</span>
                </label>
              </div>

              <div class="setting-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="dashboardLayout.sidebarCollapsed" (change)="updateDashboardLayout()">
                  <span>Barra Lateral Colapsada</span>
                </label>
              </div>
            </div>

            <!-- Notifications -->
            <div *ngIf="activeTab === 'notifications'" class="settings-section">
              <h3>Preferencias de Notificaciones</h3>

              <div class="setting-group">
                <h4>Tipos de Notificación</h4>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.emailNotifications" (change)="updateNotifications()">
                  <span>Notificaciones por Email</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.pushNotifications" (change)="updateNotifications()">
                  <span>Notificaciones Push</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.routeAlerts" (change)="updateNotifications()">
                  <span>Alertas de Ruta</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.weatherAlerts" (change)="updateNotifications()">
                  <span>Alertas del Clima</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.systemUpdates" (change)="updateNotifications()">
                  <span>Actualizaciones del Sistema</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.alertSound" (change)="updateNotifications()">
                  <span>Sonido de Alerta</span>
                </label>
              </div>

              <div class="setting-group">
                <h4>Horario Silencioso</h4>
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="notifications.quietHours.enabled" (change)="updateNotifications()">
                  <span>Habilitar Horario Silencioso</span>
                </label>
                <div *ngIf="notifications.quietHours.enabled" class="quiet-hours">
                  <label>Inicio</label>
                  <input type="time" [(ngModel)]="notifications.quietHours.start" (change)="updateNotifications()">
                  <label>Fin</label>
                  <input type="time" [(ngModel)]="notifications.quietHours.end" (change)="updateNotifications()">
                </div>
              </div>
            </div>

            <!-- User Profile -->
            <div *ngIf="activeTab === 'profile'" class="settings-section">
              <h3>Perfil de Usuario</h3>

              <div class="setting-group">
                <label for="userName">Nombre</label>
                <input type="text" id="userName" [(ngModel)]="userProfile.name" (change)="updateUserProfile()">
              </div>

              <div class="setting-group">
                <label for="userEmail">Email</label>
                <input type="email" id="userEmail" [(ngModel)]="userProfile.email" (change)="updateUserProfile()">
              </div>

              <div class="setting-group">
                <label for="userRole">Rol</label>
                <select id="userRole" [(ngModel)]="userProfile.role" (change)="updateUserProfile()">
                  <option value="Capitán">Capitán</option>
                  <option value="Oficial">Oficial</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Operador">Operador</option>
                </select>
              </div>

              <div class="setting-group">
                <label for="userCompany">Empresa</label>
                <input type="text" id="userCompany" [(ngModel)]="userProfile.company" (change)="updateUserProfile()">
              </div>

              <div class="setting-group">
                <label for="userPhone">Teléfono</label>
                <input type="tel" id="userPhone" [(ngModel)]="userProfile.phone" (change)="updateUserProfile()">
              </div>

              <div class="setting-group">
                <label for="userTimezone">Zona Horaria</label>
                <select id="userTimezone" [(ngModel)]="userProfile.timezone" (change)="updateUserProfile()">
                  <option value="UTC-12">UTC-12</option>
                  <option value="UTC-11">UTC-11</option>
                  <option value="UTC-10">UTC-10</option>
                  <option value="UTC-9">UTC-9</option>
                  <option value="UTC-8">UTC-8</option>
                  <option value="UTC-7">UTC-7</option>
                  <option value="UTC-6">UTC-6</option>
                  <option value="UTC-5">UTC-5</option>
                  <option value="UTC-4">UTC-4</option>
                  <option value="UTC-3">UTC-3</option>
                  <option value="UTC-2">UTC-2</option>
                  <option value="UTC-1">UTC-1</option>
                  <option value="UTC+0">UTC+0</option>
                  <option value="UTC+1">UTC+1</option>
                  <option value="UTC+2">UTC+2</option>
                  <option value="UTC+3">UTC+3</option>
                  <option value="UTC+4">UTC+4</option>
                  <option value="UTC+5">UTC+5</option>
                  <option value="UTC+6">UTC+6</option>
                  <option value="UTC+7">UTC+7</option>
                  <option value="UTC+8">UTC+8</option>
                  <option value="UTC+9">UTC+9</option>
                  <option value="UTC+10">UTC+10</option>
                  <option value="UTC+11">UTC+11</option>
                  <option value="UTC+12">UTC+12</option>
                </select>
              </div>

              <div class="setting-group">
                <label for="userLanguage">Idioma</label>
                <select id="userLanguage" [(ngModel)]="userProfile.language" (change)="updateUserProfile()">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>

            <!-- General Settings -->
            <div *ngIf="activeTab === 'general'" class="settings-section">
              <h3>Configuración General</h3>

              <div class="setting-group">
                <label class="checkbox-option">
                  <input type="checkbox" [(ngModel)]="generalSettings.autoSave" (change)="updateGeneralSettings()">
                  <span>Guardado Automático</span>
                </label>
              </div>

              <div class="setting-group">
                <label for="refreshInterval">Intervalo de Actualización (segundos)</label>
                <input type="number" id="refreshInterval" [(ngModel)]="refreshIntervalSeconds" (change)="updateRefreshInterval()" min="10" max="300">
              </div>

              <div class="setting-group">
                <h4>Gestión de Configuración</h4>
                <div class="button-group">
                  <button class="btn-outline" (click)="exportConfig()">Exportar Configuración</button>
                  <button class="btn-outline" (click)="importConfig()">Importar Configuración</button>
                  <button class="btn-danger" (click)="resetConfig()">Restablecer a Valores por Defecto</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-outline" (click)="closeModal()">Cancelar</button>
          <button class="btn-primary" (click)="saveAndClose()">Guardar Cambios</button>
        </div>
      </div>
    </div>

    <input type="file" #fileInput accept=".json" (change)="handleFileImport($event)" style="display: none;">
  `,
  styles: [
    `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .modal-container {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideInUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0f172a;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      background-color: #f1f5f9;
      color: #475569;
      border: none;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .close-btn:hover {
      background-color: #e2e8f0;
      color: #0f172a;
    }

    .modal-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      transition: all 150ms ease;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
    }

    .tab-btn:hover {
      color: #0a6cbc;
      background-color: #f8fafc;
    }

    .tab-btn.active {
      color: #0a6cbc;
      border-bottom-color: #0a6cbc;
    }

    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .settings-section h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }

    .setting-group {
      margin-bottom: 1.5rem;
    }

    .setting-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .setting-group input[type="text"],
    .setting-group input[type="email"],
    .setting-group input[type="tel"],
    .setting-group input[type="number"],
    .setting-group input[type="time"],
    .setting-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: border-color 150ms ease;
    }

    .setting-group input:focus,
    .setting-group select:focus {
      outline: none;
      border-color: #0a6cbc;
      box-shadow: 0 0 0 3px rgba(10, 108, 188, 0.1);
    }

    .setting-group input[type="color"] {
      width: 60px;
      height: 40px;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .radio-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      margin-bottom: 0.5rem;
    }

    .checkbox-option input[type="checkbox"],
    .radio-option input[type="radio"] {
      width: auto;
      margin: 0;
    }

    .quiet-hours {
      display: grid;
      grid-template-columns: auto 1fr auto 1fr;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.5rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 0.375rem;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-primary {
      background-color: #0a6cbc;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    .btn-primary:hover {
      background-color: #084e88;
    }

    .btn-outline {
      background-color: transparent;
      color: #475569;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .btn-outline:hover {
      background-color: #f1f5f9;
      border-color: #94a3b8;
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    .btn-danger:hover {
      background-color: #dc2626;
    }

    h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    :host-context(.dark-mode) .modal-container {
      background-color: #1e293b;
      color: #f1f5f9;
    }

    :host-context(.dark-mode) .modal-header {
      border-bottom-color: #334155;
    }

    :host-context(.dark-mode) .modal-header h2 {
      color: #f1f5f9;
    }

    :host-context(.dark-mode) .tabs {
      border-bottom-color: #334155;
    }

    :host-context(.dark-mode) .tab-btn {
      color: #94a3b8;
    }

    :host-context(.dark-mode) .tab-btn:hover {
      background-color: #334155;
    }

    :host-context(.dark-mode) .settings-section h3 {
      color: #f1f5f9;
    }

    :host-context(.dark-mode) .setting-group label {
      color: #e2e8f0;
    }

    :host-context(.dark-mode) .setting-group input,
    :host-context(.dark-mode) .setting-group select {
      background-color: #334155;
      border-color: #475569;
      color: #f1f5f9;
    }

    :host-context(.dark-mode) .quiet-hours {
      background-color: #334155;
    }

    :host-context(.dark-mode) .modal-footer {
      border-top-color: #334155;
    }
  `,
  ],
})
export class ConfigurationModalComponent implements OnInit {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()

  activeTab = "theme"

  themeConfig: ThemeConfig = {
    mode: "light",
    primaryColor: "#0a6cbc",
    accentColor: "#ff6e40",
    fontSize: "medium",
    animations: true,
    compactMode: false,
  }

  dashboardLayout: DashboardLayout = {
    showSidebar: true,
    sidebarCollapsed: false,
    showWeatherWidget: true,
    showStatistics: true,
    showRecentRoutes: true,
    gridLayout: "comfortable",
    mapPosition: "top",
  }

  notifications: NotificationPreferences = {
    emailNotifications: true,
    pushNotifications: true,
    routeAlerts: true,
    weatherAlerts: true,
    systemUpdates: true,
    marketingEmails: false,
    alertSound: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  }

  userProfile: UserProfile = {
    name: "Usuario Demo",
    email: "demo@maritime.com",
    role: "Capitán",
    company: "Maritime Solutions",
    phone: "+1 234 567 8900",
    timezone: "UTC-5",
    language: "es",
  }

  generalSettings = {
    autoSave: true,
  }

  refreshIntervalSeconds = 30

  tabs = [
    { id: "theme", label: "Tema", icon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" },
    { id: "layout", label: "Diseño", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    },
    {
      id: "profile",
      label: "Perfil",
      icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    },
    {
      id: "general",
      label: "General",
      icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    },
  ]

  constructor(
    private configService: ConfigurationService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadCurrentSettings()
  }

  private loadCurrentSettings(): void {
    const config = this.configService.getCurrentConfiguration()
    this.dashboardLayout = { ...config.dashboardLayout }
    this.notifications = { ...config.notifications }
    this.userProfile = { ...config.userProfile }
    this.generalSettings.autoSave = config.autoSave
    this.refreshIntervalSeconds = config.dataRefreshInterval / 1000

    this.themeConfig = { ...this.themeService.getCurrentThemeConfig() }
  }

  updateTheme(): void {
    this.themeService.updateThemeConfig(this.themeConfig)
  }

  updateDashboardLayout(): void {
    this.configService.updateDashboardLayout(this.dashboardLayout)
  }

  updateNotifications(): void {
    this.configService.updateNotificationPreferences(this.notifications)
  }

  updateUserProfile(): void {
    this.configService.updateUserProfile(this.userProfile)
  }

  updateGeneralSettings(): void {
    this.configService.updateGeneralSettings({
      autoSave: this.generalSettings.autoSave,
    })
  }

  updateRefreshInterval(): void {
    this.configService.updateGeneralSettings({
      dataRefreshInterval: this.refreshIntervalSeconds * 1000,
    })
  }

  exportConfig(): void {
    const config = this.configService.exportConfiguration()
    const blob = new Blob([config], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "maritime-config.json"
    link.click()
    window.URL.revokeObjectURL(url)
  }

  importConfig(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fileInput?.click()
  }

  handleFileImport(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = e.target?.result as string
          if (this.configService.importConfiguration(config)) {
            this.loadCurrentSettings()
            alert("Configuración importada exitosamente")
          } else {
            alert("Error al importar la configuración")
          }
        } catch {
          alert("Archivo de configuración inválido")
        }
      }
      reader.readAsText(file)
    }
  }

  resetConfig(): void {
    if (confirm("¿Está seguro de que desea restablecer toda la configuración a los valores por defecto?")) {
      this.configService.resetToDefaults()
      this.themeService.resetToDefaults()
      this.loadCurrentSettings()
      alert("Configuración restablecida a valores por defecto")
    }
  }

  closeModal(): void {
    this.close.emit()
  }

  saveAndClose(): void {
    // All changes are saved automatically, just close
    this.closeModal()
  }
}
