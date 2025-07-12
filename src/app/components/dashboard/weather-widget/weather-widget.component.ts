import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

interface WeatherAlert {
  location: string
  condition: string
  impact: string
}

@Component({
  selector: "app-weather-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="weather-widget-container">
      <div class="widget-header">
        <h3 class="widget-title">Weather Alerts</h3>
        <button class="widget-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>

      <div class="alerts-list">
        <div class="alert-item" *ngFor="let alert of alerts" [ngClass]="'impact-' + alert.impact.toLowerCase()">
          <div class="alert-icon">
            <svg *ngIf="alert.condition.includes('Storm')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
              <polyline points="13 11 9 17 15 17 11 23"></polyline>
            </svg>
            <svg *ngIf="alert.condition.includes('Fog')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10h18"></path>
              <path d="M3 14h18"></path>
              <path d="M3 18h18"></path>
              <path d="M3 22h18"></path>
            </svg>
            <svg *ngIf="alert.condition.includes('Clear')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          </div>
          <div class="alert-content">
            <div class="alert-location">{{ alert.location }}</div>
            <div class="alert-condition">{{ alert.condition }}</div>
            <div class="alert-impact">
              <span class="impact-badge" [ngClass]="'impact-' + alert.impact.toLowerCase()">{{ alert.impact }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="widget-footer">
        <button class="view-all-btn">View All Alerts</button>
      </div>
    </div>
  `,
  styles: [
    `

    .weather-widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .widget-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .widget-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background-color: transparent;
      color: #475569;
      border: none;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 0.375rem;
      transition: transform 150ms ease, box-shadow 150ms ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      &.impact-high {
        border-left: 3px solid #f44336;
      }

      &.impact-medium {
        border-left: 3px solid #ffc107;
      }

      &.impact-low {
        border-left: 3px solid #00c853;
      }
    }

    .alert-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 0.375rem;
      background-color: white;
      color: #475569;
      flex-shrink: 0;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

      .impact-high & {
        color: #f44336;
      }

      .impact-medium & {
        color: #ffc107;
      }

      .impact-low & {
        color: #00c853;
      }
    }

    .alert-content {
      flex: 1;
    }

    .alert-location {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .alert-condition {
      font-size: 0.875rem;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .impact-badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;

      &.impact-high {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }

      &.impact-medium {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }

      &.impact-low {
        background-color: rgba(0, 200, 83, 0.1);
        color: #00c853;
      }
    }

    .widget-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }

    .view-all-btn {
      background: none;
      border: none;
      color: #0a6cbc;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 150ms ease;

      &:hover {
        background-color: rgba(10, 108, 188, 0.05);
        text-decoration: underline;
      }
    }
  `,
  ],
})
export class WeatherWidgetComponent {
  @Input() alerts: WeatherAlert[] = []
}
