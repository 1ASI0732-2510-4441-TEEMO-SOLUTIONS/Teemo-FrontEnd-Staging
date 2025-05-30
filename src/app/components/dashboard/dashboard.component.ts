import { Component, type OnInit, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { MapComponent } from "./map/map.component"
import { RouteCardComponent } from "./route-card/route-card.component"
import { PortSelectorComponent } from "./port-selector/port-selector.component"
import { SidebarComponent } from "../shared/sidebar/sidebar.component"
import { HeaderComponent } from "../shared/header/header.component"
import { RouteAnimationComponent } from "./route-animation/route-animation.component"
import { AnimationService } from "../../services/animation.service"

interface Route {
  id: number
  name: string
  status: string
  vessels: number
  distance: string
  eta: string
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MapComponent,
    RouteCardComponent,
    PortSelectorComponent,
    SidebarComponent,
    HeaderComponent,
    RouteAnimationComponent,
  ],
  template: `
    <!-- Splash Screen -->
    <div *ngIf="showSplash" class="splash-screen" [class.hidden]="splashHidden">
      <div class="splash-content">
        <div class="splash-logo">
          <svg width="160" height="160" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Tallo más ancho y menos alto -->
            <rect x="57" y="75" width="28" height="30" rx="8" fill="#f8fafc"/>

            <!-- Sombrero principal agrandado -->
            <path d="M25 55C25 30 70 20 70 20C70 20 115 30 115 55C115 80 70 75 70 75C70 75 25 80 25 55Z" fill="#0a6cbc"/>

            <!-- Parte inferior del sombrero -->
            <ellipse cx="70" cy="60" rx="45" ry="18" fill="#084e88"/>

            <!-- Ojos con animación de brillo estelar -->
            <g class="starry-eyes">
              <!-- Ojo izquierdo -->
              <circle class="eye-base" cx="50" cy="50" r="10" fill="#f8fafc"/>
              <!-- Destellos ojo izquierdo -->
              <g class="eye-sparkles">
                <circle class="sparkle" cx="55" cy="45" r="2" fill="#ffffff"/>
                <circle class="sparkle" cx="48" cy="53" r="1.5" fill="#ffffff"/>
                <circle class="sparkle" cx="52" cy="55" r="1" fill="#ffffff"/>
                <circle class="sparkle" cx="45" cy="48" r="1.2" fill="#ffffff"/>
              </g>

              <!-- Ojo derecho -->
              <circle class="eye-base" cx="90" cy="50" r="10" fill="#f8fafc"/>
              <!-- Destellos ojo derecho -->
              <g class="eye-sparkles">
                <circle class="sparkle" cx="95" cy="45" r="2" fill="#ffffff"/>
                <circle class="sparkle" cx="88" cy="53" r="1.5" fill="#ffffff"/>
                <circle class="sparkle" cx="92" cy="55" r="1" fill="#ffffff"/>
                <circle class="sparkle" cx="85" cy="48" r="1.2" fill="#ffffff"/>
              </g>
            </g>

            <!-- Pupilas fijas -->
            <circle cx="50" cy="50" r="4" fill="#0a6cbc"/>
            <circle cx="90" cy="50" r="4" fill="#0a6cbc"/>

            <!-- Sonrisa -->

            <!-- Manchas más grandes -->
            <circle cx="40" cy="40" r="8" fill="#f8fafc"/>
            <circle cx="70" cy="35" r="5" fill="#f8fafc"/>
            <circle cx="100" cy="40" r="7" fill="#f8fafc"/>
            <circle cx="60" cy="30" r="4" fill="#f8fafc"/>
          </svg>
        </div>
        <h1>MUSHROOM</h1>
      </div>
    </div>

    <div *ngIf="!showSplash" class="app-container">
      <app-sidebar [currentUser]="currentUser"></app-sidebar>

      <div class="main-content">
        <app-header
          pageTitle="Mushroom"
          [notificationCount]="3"
        >
          <button class="btn-primary" (click)="togglePortSelector()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ showPortSelector ? 'Cancelar Selección' : 'Nueva Ruta' }}
          </button>
        </app-header>

        <main class="dashboard-content">
          <!-- Error message display -->
          <div class="error-message" *ngIf="errorMessage">
            <div class="error-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            <button class="close-error" (click)="errorMessage = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Port Selector Component -->
          <app-port-selector
            *ngIf="showPortSelector"
            (cancel)="handleCancelRouteCreation()"
            class="animate-fadeIn">
          </app-port-selector>

          <div *ngIf="!showPortSelector" class="dashboard-grid animate-fadeIn">
            <!-- Map Component - Eliminada la barra de título duplicada -->
            <div class="map-container">
              <!-- Eliminamos el card-header duplicado -->
              <app-map></app-map>
            </div>

            <!-- Routes Section -->
            <div class="routes-container">
              <div class="card-header">
                <h2>Rutas Activas</h2>
                <div class="card-actions">
                  <button class="btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Filtrar
                  </button>
                  <button class="btn-primary btn-sm" (click)="togglePortSelector()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva Ruta
                  </button>
                </div>
              </div>
              <div class="routes-grid">
                <app-route-card
                  *ngFor="let route of routes"
                  [route]="route"
                  class="animate-slideInUp">
                </app-route-card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      /* Splash screen styles */
      .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #0f172a;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.8s ease, transform 1.2s ease;
      }

      .splash-screen.hidden {
        opacity: 0;
        transform: scale(1.2);
        pointer-events: none;
      }

      .splash-content {
        text-align: center;
        color: white;
      }

      .splash-logo {
        margin-bottom: 2rem;
        animation: pulse 2s infinite ease-in-out;
      }

      .splash-content h1 {
        font-size: 3rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        animation: fadeIn 1.5s ease;
      }

      /* Animación de brillo estelar */
      .starry-eyes {
        transform-origin: center;
      }

      .eye-base {
        animation: pulse-glow 3s infinite ease-in-out;
      }

      .sparkle {
        opacity: 0;
        animation: twinkle 3s infinite;
      }

      .sparkle:nth-child(1) { animation-delay: 0.2s; }
      .sparkle:nth-child(2) { animation-delay: 0.8s; }
      .sparkle:nth-child(3) { animation-delay: 1.4s; }
      .sparkle:nth-child(4) { animation-delay: 2.0s; }

      @keyframes pulse-glow {
        0%, 100% {
          filter: drop-shadow(0 0 0px rgba(255, 255, 255, 0));
        }
        50% {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
        }
      }

      @keyframes twinkle {
        0%, 100% {
          opacity: 0;
          transform: scale(0.1);
        }
        10%, 90% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.5) rotate(15deg);
        }
      }

      @keyframes star-pulse {
        0%, 100% {
          transform: scale(1);
          filter: brightness(1);
        }
        50% {
          transform: scale(1.05);
          filter: brightness(1.5);
        }
      }

      @keyframes sparkle-rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .blinking-eyes {
        animation: blink 5s infinite;
        transform-origin: center;
      }

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

      .dashboard-content {
        padding: 2rem;
        padding-top: calc(70px + 2rem);
      }

      .error-message {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        background-color: rgba(244, 67, 54, 0.1);
        border-left: 4px solid #f44336;
        border-radius: 0.375rem;
        color: #f44336;
        margin-bottom: 1.5rem;
        animation: fadeIn 250ms ease forwards;

        .error-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-error {
          background: none;
          border: none;
          color: #f44336;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 9999px;
          transition: background-color 150ms ease;

          &:hover {
            background-color: rgba(244, 67, 54, 0.1);
          }
        }
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-areas:
        "map"
        "routes";
        gap: 1.5rem;
      }

      .map-container {
        grid-area: map;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 500px; /* Increased height for better visibility */
      }

      .routes-container {
        grid-area: routes;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        overflow: hidden;
        display: flex;
        flex-direction: column;
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

      .routes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        padding: 1.5rem;
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

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
      }

      .mr-2 {
        margin-right: 0.5rem;
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

      .animate-fadeIn {
        animation: fadeIn 250ms ease forwards;
      }

      .animate-slideInUp {
        animation: slideInUp 250ms ease forwards;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentUser = {
    name: "Usuario Demo",
    role: "Capitán",
  }

  routes: Route[] = [
    {
      id: 1,
      name: "Singapore to Rotterdam",
      status: "Active",
      vessels: 3,
      distance: "8,450 nm",
      eta: "May 15, 2023",
    },
    {
      id: 2,
      name: "Shanghai to Los Angeles",
      status: "Active",
      vessels: 2,
      distance: "6,250 nm",
      eta: "May 10, 2023",
    },
    {
      id: 3,
      name: "New York to Southampton",
      status: "Scheduled",
      vessels: 1,
      distance: "3,400 nm",
      eta: "May 20, 2023",
    },
    {
      id: 4,
      name: "Dubai to Mumbai",
      status: "Completed",
      vessels: 2,
      distance: "1,200 nm",
      eta: "Completed",
    },
  ]

  showPortSelector = false
  errorMessage: string | null = null
  sidebarCollapsed = true
  showSplash = true
  splashHidden = false

  constructor(private animationService: AnimationService) {}

  ngOnInit(): void {
    // Check if sidebar state is saved
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState) {
      this.sidebarCollapsed = savedState === "true";
    }

    // Verificar si el splash ya se mostró en esta sesión
    const splashAlreadyShown = sessionStorage.getItem('splashShown');

    if (splashAlreadyShown) {
      this.showSplash = false;
      this.splashHidden = true;
    } else {
      sessionStorage.setItem('splashShown', 'true');

      // Splash screen timing
      setTimeout(() => {
        this.splashHidden = true;
        setTimeout(() => {
          this.showSplash = false;
        }, 800);
      }, 3000);
    }
  }


  handleSplashScreen(): void {
    // Splash screen timing
    setTimeout(() => {
      this.splashHidden = true;
      setTimeout(() => {
        this.showSplash = false;
      }, 800);
    }, 3000);
  }

  ngAfterViewInit(): void {
    // Iniciar animaciones solo después del splash screen
    setTimeout(() => {
      if (this.showSplash) return; // Si aún está mostrando el splash, no ejecutar

      // Animate route cards with staggered effect
      this.animationService.animateDashboardCards(".route-card")

      // Add hover animations to cards
      this.animationService.addHoverAnimation(".route-card")

      // Animate statistics when they come into view
      this.animationService.animateOnScroll(".stat-card")

      // Animate progress bars
      const progressBars = document.querySelectorAll(".progress-fill")
      progressBars.forEach((element) => {
        // Cast Element to HTMLElement
        const bar = element as HTMLElement
        const width = bar.style.width
        bar.style.width = "0"
        setTimeout(() => {
          this.animationService.animateProgressBar(bar, width)
        }, 300)
      })

      // Animate counters in statistics
      const statValues = document.querySelectorAll(".stat-value")
      statValues.forEach((element) => {
        // Cast Element to HTMLElement
        const el = element as HTMLElement
        const value = Number.parseInt(el.textContent || "0", 10)
        el.textContent = "0"
        this.animationService.animateCounter(el, value)
      })
    }, 3500) // 3000ms de splash + 500ms de margen
  }

  togglePortSelector(): void {
    this.showPortSelector = !this.showPortSelector
  }

  handleCancelRouteCreation(): void {
    this.showPortSelector = false
  }

  logout(): void {
    window.location.href = "/dashboard"
  }
}
