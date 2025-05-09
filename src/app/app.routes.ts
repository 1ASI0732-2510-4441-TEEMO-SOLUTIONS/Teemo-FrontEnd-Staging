import type { Routes } from "@angular/router"

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "shipment-reports",
    loadComponent: () =>
      import("./components/reports/shipment-reports/shipment-reports.component").then(
        (m) => m.ShipmentReportsComponent,
      ),
  },
  {
    path: "route-history",
    loadComponent: () =>
      import("./components/reports/route-history/route-history.component").then((m) => m.RouteHistoryComponent),
  },
  {
    path: "nearby-ports",
    loadComponent: () =>
      import("./components/captain/nearby-ports/nearby-ports.component").then((m) => m.NearbyPortsComponent),
  },
  { path: "**", redirectTo: "dashboard" },
]
