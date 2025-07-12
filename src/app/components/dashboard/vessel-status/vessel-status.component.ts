import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

interface Vessel {
  id: string
  name: string
  status: string
  location: string
  fuel: string
}

@Component({
  selector: "app-vessel-status",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vessel-status-container">
      <div class="widget-header">
        <h3 class="widget-title">Vessel Status</h3>
        <button class="widget-action">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>

      <div class="vessel-list">
        <div class="vessel-item" *ngFor="let vessel of vessels">
          <div class="vessel-header">
            <div class="vessel-info">
              <h4 class="vessel-name">{{ vessel.name }}</h4>
              <span class="vessel-id">{{ vessel.id }}</span>
            </div>
            <span class="vessel-status" [ngClass]="'status-' + vessel.status.toLowerCase().replace(' ', '-')">
              {{ vessel.status }}
            </span>
          </div>
          <div class="vessel-details">
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ vessel.location }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fuel:</span>
              <div class="fuel-container">
                <div class="fuel-bar">
                  <div class="fuel-level" [style.width]="vessel.fuel"></div>
                </div>
                <span class="fuel-text">{{ vessel.fuel }}</span>
              </div>
            </div>
          </div>
          <div class="vessel-actions">
            <button class="vessel-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              View
            </button>
            <button class="vessel-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `

    .vessel-status-container {
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

    .vessel-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 1.5rem;
      overflow-y: auto;
    }

    .vessel-item {
      background-color: #f8fafc;
      border-radius: 0.375rem;
      padding: 1rem;
      transition: transform 150ms ease, box-shadow 150ms ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
    }

    .vessel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .vessel-info {
      display: flex;
      flex-direction: column;
    }

    .vessel-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #0f172a;
    }

    .vessel-id {
      font-size: 0.75rem;
      color: #64748b;
    }

    .vessel-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;

      &.status-on-route {
        background-color: rgba(0, 200, 83, 0.1);
        color: #00c853;
      }

      &.status-docked {
        background-color: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }

      &.status-maintenance {
        background-color: rgba(255, 193, 7, 0.1);
        color: #ffc107;
      }
    }

    .vessel-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .detail-label {
      color: #475569;
    }

    .detail-value {
      font-weight: 500;
      color: #0f172a;
    }

    .fuel-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .fuel-bar {
      width: 80px;
      height: 6px;
      background-color: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .fuel-level {
      height: 100%;
      background-color: #00c853;
      border-radius: 9999px;
    }

    .fuel-text {
      font-weight: 500;
      color: #0f172a;
    }

    .vessel-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .vessel-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: white;
      color: #475569;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 150ms ease;

      &:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }

      svg {
        flex-shrink: 0;
      }
    }
  `,
  ],
})
export class VesselStatusComponent {
  @Input() vessels: Vessel[] = []
}
