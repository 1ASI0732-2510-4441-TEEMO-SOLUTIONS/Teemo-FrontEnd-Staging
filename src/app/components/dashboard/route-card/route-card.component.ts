import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

interface Route {
  id: number
  name: string
  status: string
  vessels: number
  distance: string
  eta: string
}

@Component({
  selector: "app-route-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="route-card" [ngClass]="'status-' + route.status.toLowerCase()">
      <div class="route-header">
        <h3>{{ route.name }}</h3>
        <span class="status-badge">{{ route.status }}</span>
      </div>
      <div class="route-details">
        <div class="detail-item">
          <span class="label">Vessels</span>
          <span class="value">{{ route.vessels }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Distance</span>
          <span class="value">{{ route.distance }}</span>
        </div>
        <div class="detail-item">
          <span class="label">ETA</span>
          <span class="value">{{ route.eta }}</span>
        </div>
      </div>
      <div class="route-actions">
        <button class="route-btn">Details</button>
        <button class="route-btn">Track</button>
      </div>
    </div>
  `,
  styles: [
    `
    .route-card {
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-top: 4px solid #ccc;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      &.status-active {
        border-top-color: #34a853;
      }

      &.status-scheduled {
        border-top-color: #fbbc05;
      }

      &.status-completed {
        border-top-color: #4285f4;
      }
    }

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #2c3e50;
      }

      .status-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-weight: 500;

        .status-active & {
          background-color: rgba(52, 168, 83, 0.1);
          color: #34a853;
        }

        .status-scheduled & {
          background-color: rgba(251, 188, 5, 0.1);
          color: #fbbc05;
        }

        .status-completed & {
          background-color: rgba(66, 133, 244, 0.1);
          color: #4285f4;
        }
      }
    }

    .route-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;

      .detail-item {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-size: 0.75rem;
        color: #5f6368;
      }

      .value {
        font-size: 0.875rem;
        font-weight: 500;
        color: #2c3e50;
      }
    }

    .route-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;

      .route-btn {
        padding: 0.25rem 0.75rem;
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
  `,
  ],
})
export class RouteCardComponent {
  @Input() route!: Route
}
