import type { Routes } from "@angular/router" // Regular import for Routes
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { LoginComponent } from "./components/auth/login/ login.component"
import { AuthGuard } from "./guards/auth.guard"

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard] },
  // Add other protected routes as needed
  { path: "**", redirectTo: "dashboard" },
]
