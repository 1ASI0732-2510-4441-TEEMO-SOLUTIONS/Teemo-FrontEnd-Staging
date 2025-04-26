import { Injectable } from "@angular/core"
import { CanActivate, Router, UrlTree } from "@angular/router" // Regular import for Router and UrlTree
import { Observable } from "rxjs" // Regular import for Observable
import  { AuthService } from "../services/auth.service" // Regular import for AuthService

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true
    }

    // Redirect to login page
    return this.router.createUrlTree(["/login"])
  }
}
