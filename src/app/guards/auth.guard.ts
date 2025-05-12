import { Injectable } from "@angular/core"
import { Router, CanActivateFn } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate: CanActivateFn = (route, state) => {
    if (this.authService.isLoggedIn) {
      // Verificar si el token ha expirado
      if (this.authService.isTokenExpired()) {
        this.authService.logout()
        this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
        return false
      }
      return true
    }

    // No está autenticado, redirigir al login
    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
    return false
  }
}
