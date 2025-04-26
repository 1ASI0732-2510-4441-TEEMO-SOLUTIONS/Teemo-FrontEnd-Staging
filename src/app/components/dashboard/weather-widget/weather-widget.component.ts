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
      <h3 class="widget-title">Weather Alerts</h3>
      <div class="alerts-list">
        <div class="alert-item" *ngFor="let alert of alerts" [ngClass]="'impact-' + alert.impact.toLowerCase()">
          <div class="alert-icon">
            <svg *ngIf="alert.condition.includes('Storm')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
              <polyline points="13 11 9 17 15 17 11 23"></polyline>
            </svg>
            <svg *ngIf="alert.condition.includes('Fog')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10h18"></path>
              <path d="M3 14h18"></path>
              <path d="M3 18h18"></path>
              <path d="M3 22h18"></path>
            </svg>
          </div>
          <div class="alert-content">
            <div class="alert-location">{{ alert.location }}</div>
            <div class="alert-condition">{{ alert.condition }}</div>
            <div class="alert-impact">Impact: {{ alert.impact }}</div>
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
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .widget-title {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-radius: 6px;
      background-color: #f8f9fa;
      border-left: 4px solid #ccc;

      &.impact-high {
        border-left-color: #ea4335;
      }

      &.impact-medium {
        border-left-color: #fbbc05;
      }

      &.impact-low {
        border-left-color: #34a853;
      }
    }

    .alert-icon {
      margin-right: 0.75rem;
      color: #5f6368;
    }

    .alert-content {
      flex: 1;
    }

    .alert-location {
      font-weight: 500;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .alert-condition {
      font-size: 0.8rem;
      color: #5f6368;
    }

    .alert-impact {
      font-size: 0.8rem;
      margin-top: 0.25rem;

      .impact-high & {
        color: #ea4335;
      }

      .impact-medium & {
        color: #fbbc05;
      }

      .impact-low & {
        color: #34a853;
      }
    }

    .widget-footer {
      text-align: center;
    }

    .view-all-btn {
      background: none;
      border: none;
      color: #1a73e8;
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0.5rem;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
  ],
})
export class WeatherWidgetComponent {
  @Input() alerts: WeatherAlert[] = []
}
