import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router" // Regular import for Router
import { MapComponent } from "./map/map.component"
import { RouteCardComponent } from "./route-card/route-card.component"
import { StatisticsComponent } from "./statistics/statistics.component"
import { WeatherWidgetComponent } from "./weather-widget/weather-widget.component"
import { VesselStatusComponent } from "./vessel-status/vessel-status.component"
import { AuthService } from "../../services/auth.service" // Regular import for AuthService

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MapComponent,
    RouteCardComponent,
    StatisticsComponent,
    WeatherWidgetComponent,
    VesselStatusComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  routes = [
    { id: 1, name: "Rotterdam - Singapore", status: "Active", vessels: 3, distance: "8,450 nm", eta: "14 days" },
    { id: 2, name: "Shanghai - Los Angeles", status: "Scheduled", vessels: 2, distance: "6,250 nm", eta: "11 days" },
    { id: 3, name: "New York - Liverpool", status: "Completed", vessels: 1, distance: "3,300 nm", eta: "7 days" },
    { id: 4, name: "Cape Town - Sydney", status: "Active", vessels: 2, distance: "6,800 nm", eta: "12 days" },
  ]

  vesselStatuses = [
    { id: "V001", name: "Maersk Explorer", status: "On Route", location: "34.05°N, 118.25°W", fuel: "78%" },
    { id: "V002", name: "Pacific Voyager", status: "Docked", location: "51.51°N, 0.13°W", fuel: "92%" },
    { id: "V003", name: "Atlantic Carrier", status: "Maintenance", location: "40.71°N, 74.01°W", fuel: "45%" },
  ]

  weatherAlerts = [
    { location: "North Atlantic", condition: "Storm Warning", impact: "High" },
    { location: "South China Sea", condition: "Fog", impact: "Medium" },
  ]

  statistics = {
    activeRoutes: 8,
    vesselsInTransit: 12,
    completedThisMonth: 24,
    fuelEfficiency: "87%",
  }

  currentUser: any = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(["/login"])
    })
  }
}
