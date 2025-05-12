import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="breadcrumbs" *ngIf="breadcrumbs && breadcrumbs.length > 0">
            <a [routerLink]="['/dashboard']" class="breadcrumb-item">Dashboard</a>
            <span class="breadcrumb-separator">/</span>
            <ng-container *ngFor="let crumb of breadcrumbs; let last = last; let i = index">
              <a
                *ngIf="!last && crumb.link"
                [routerLink]="[crumb.link]"
                class="breadcrumb-item"
              >{{ crumb.label }}</a>
              <span
                *ngIf="!last && !crumb.link"
                class="breadcrumb-item"
              >{{ crumb.label }}</span>
              <span
                *ngIf="last"
                class="breadcrumb-item breadcrumb-active"
              >{{ crumb.label }}</span>
              <span *ngIf="!last" class="breadcrumb-separator">/</span>
            </ng-container>
          </div>
        </div>

        <div class="header-right">
          <ng-content></ng-content>

          <div class="header-actions">
            <a [routerLink]="['/register']" class="register-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Registrar Usuario</span>
            </a>

            <button class="action-btn" title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notification-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
            </button>

            <button class="action-btn" title="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            <div class="theme-toggle">
              <button class="theme-btn" (click)="toggleTheme()" title="Toggle theme">
                <svg *ngIf="!isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg *ngIf="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
            </div>

            <button class="logout-btn" (click)="logout()" title="Cerrar sesión">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `

    .header {
      background-color: white;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      height: 70px;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      position: fixed;
      top: 0;
      right: 0;
      left: 80px;
      z-index: 50;
      transition: left 250ms ease;

      &.sidebar-expanded {
        left: 260px;
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .header-left {
      display: flex;
      flex-direction: column;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .breadcrumb-item {
      color: #64748b;
      text-decoration: none;

      &:hover {
        color: #0a6cbc;
        text-decoration: underline;
      }

      &.breadcrumb-active {
        color: #475569;
        font-weight: 500;
      }
    }

    .breadcrumb-separator {
      margin: 0 0.25rem;
      color: #94a3b8;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn, .logout-btn, .theme-btn {
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
      position: relative;

      &:hover {
        background-color: #e2e8f0;
        color: #0f172a;
      }
    }

    .logout-btn {
      &:hover {
        background-color: #fee2e2;
        color: #ef4444;
      }
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background-color: #ff6e40;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-toggle {
      margin-left: 0.5rem;
    }

    .register-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #0a6cbc;
      color: white;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 150ms ease;

      &:hover {
        background-color: #084e88;
      }

      svg {
        flex-shrink: 0;
      }
    }
  `,
  ],
})
export class HeaderComponent {
  @Input() pageTitle = "Dashboard"
  @Input() breadcrumbs: { label: string; link?: string }[] = []
  @Input() notificationCount = 0
  @Input() sidebarCollapsed = false

  @Output() themeToggled = new EventEmitter<boolean>()

  isDarkMode = false

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check if dark mode is enabled
    const darkMode = localStorage.getItem("dark_mode")
    this.isDarkMode = darkMode === "true"

    // Apply dark mode if enabled
    if (this.isDarkMode) {
      document.documentElement.classList.add("dark-mode")
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode

    // Save preference
    localStorage.setItem("dark_mode", this.isDarkMode.toString())

    // Apply or remove dark mode class
    if (this.isDarkMode) {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }

    this.themeToggled.emit(this.isDarkMode)
  }

  logout(): void {
    this.authService.logout()
  }
}
