import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-statistics",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="statistics-container">
      <div class="stat-card">
        <div class="stat-icon active-routes-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ activeRoutes }}</span>
          <span class="stat-label">Active Routes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon vessels-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ vesselsInTransit }}</span>
          <span class="stat-label">Vessels in Transit</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ completedThisMonth }}</span>
          <span class="stat-label">Completed This Month</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon efficiency-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ fuelEfficiency }}</span>
          <span class="stat-label">Fuel Efficiency</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .statistics-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;

      &.active-routes-icon {
        background-color: rgba(26, 115, 232, 0.1);
        color: #1a73e8;
      }

      &.vessels-icon {
        background-color: rgba(52, 168, 83, 0.1);
        color: #34a853;
      }

      &.completed-icon {
        background-color: rgba(251, 188, 5, 0.1);
        color: #fbbc05;
      }

      &.efficiency-icon {
        background-color: rgba(234, 67, 53, 0.1);
        color: #ea4335;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #5f6368;
    }

    @media (max-width: 1200px) {
      .statistics-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .statistics-container {
        grid-template-columns: 1fr;
      }
    }
  `,
  ],
})
export class StatisticsComponent {
  @Input() activeRoutes = 0
  @Input() vesselsInTransit = 0
  @Input() completedThisMonth = 0
  @Input() fuelEfficiency = "0%"
}
