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
      <h3 class="widget-title">Vessel Status</h3>
      <div class="vessel-list">
        <div class="vessel-item" *ngFor="let vessel of vessels">
          <div class="vessel-header">
            <h4 class="vessel-name">{{ vessel.name }}</h4>
            <span class="vessel-id">{{ vessel.id }}</span>
          </div>
          <div class="vessel-details">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value" [ngClass]="'status-' + vessel.status.toLowerCase().replace(' ', '-')">
                {{ vessel.status }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ vessel.location }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fuel:</span>
              <span class="detail-value">
                <div class="fuel-bar">
                  <div class="fuel-level" [style.width]="vessel.fuel"></div>
                </div>
                {{ vessel.fuel }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .vessel-status-container {
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

    .vessel-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .vessel-item {
      padding: 0.75rem;
      border-radius: 6px;
      background-color: #f8f9fa;
    }

    .vessel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .vessel-name {
      margin: 0;
      font-size: 1rem;
      color: #2c3e50;
    }

    .vessel-id {
      font-size: 0.75rem;
      color: #5f6368;
    }

    .vessel-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .detail-label {
      color: #5f6368;
    }

    .detail-value {
      font-weight: 500;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.status-on-route {
        color: #34a853;
      }

      &.status-docked {
        color: #4285f4;
      }

      &.status-maintenance {
        color: #fbbc05;
      }
    }

    .fuel-bar {
      width: 60px;
      height: 6px;
      background-color: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .fuel-level {
      height: 100%;
      background-color: #34a853;
      border-radius: 3px;
    }
  `,
  ],
})
export class VesselStatusComponent {
  @Input() vessels: Vessel[] = []
}
