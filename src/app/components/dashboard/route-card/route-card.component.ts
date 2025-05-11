import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Route } from "../../../services/route.service"

@Component({
  selector: "app-route-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="route-card" [ngClass]="'status-' + route.status.toLowerCase()">
      <div class="route-header">
        <h3 class="route-name">{{ route.name }}</h3>
        <span class="status-badge" [ngClass]="'status-' + route.status.toLowerCase()">
          {{ route.status }}
        </span>
      </div>
      <div class="route-details">
        <div class="detail-item">
          <span class="detail-label">Vessels</span>
          <span class="detail-value">{{ route.vessels }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Distance</span>
          <span class="detail-value">{{ route.distance }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">ETA</span>
          <span class="detail-value">{{ route.eta }}</span>
        </div>
      </div>
      <div class="route-progress" *ngIf="route.status === 'Active'">
        <div class="progress-label">
          <span>Progress</span>
          <span>65%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 65%"></div>
        </div>
      </div>
      <div class="route-actions">
        <button class="route-btn details-btn" (click)="onViewDetails()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Details
        </button>
        <button class="route-btn track-btn" (click)="onTrack()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Track
        </button>
      </div>
    </div>
  `,
  styles: [
    `

    .route-card {
      background-color: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: transform 250ms ease, box-shadow 250ms ease;
      border-top: 4px solid #cbd5e1;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }

      &.status-active {
        border-top-color: #00c853;
      }

      &.status-scheduled {
        border-top-color: #ffc107;
      }

      &.status-completed {
        border-top-color: #2196f3;
      }
    }

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .route-name {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.status-active {
        background-color: rgba(0, 200, 83, 0.1);
        color: #00c853;
      }

      &.status-scheduled {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }

      &.status-completed {
        background-color: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }
    }

    .route-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .detail-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f172a;
    }

    .route-progress {
      margin-bottom: 1rem;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #475569;
      margin-bottom: 0.25rem;
    }

    .progress-bar {
      height: 6px;
      background-color: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: #00c853;
      border-radius: 9999px;
    }

    .route-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .route-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;

      svg {
        flex-shrink: 0;
      }
    }

    .details-btn {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;

      &:hover {
        background-color: #e2e8f0;
        color: #0f172a;
      }
    }

    .track-btn {
      background-color: #0a6cbc;
      color: white;
      border: none;

      &:hover {
        background-color: #084e88;
      }
    }
  `,
  ],
})
export class RouteCardComponent {
  @Input() route!: Route
  @Output() viewDetails = new EventEmitter<number>()
  @Output() track = new EventEmitter<number>()

  onViewDetails(): void {
    this.viewDetails.emit(this.route.id)
  }

  onTrack(): void {
    this.track.emit(this.route.id)
  }
}
