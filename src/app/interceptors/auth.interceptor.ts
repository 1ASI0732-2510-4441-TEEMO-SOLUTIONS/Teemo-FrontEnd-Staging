import type { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError, throwError } from "rxjs"
import { AuthService } from "../services/auth.service"
import { Router } from "@angular/router"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  // No interceptar solicitudes a assets o recursos estáticos
  if (req.url.includes("/assets/") || req.url.includes(".json")) {
    return next(req)
  }

  // No añadir token a las rutas de autenticación (login, registro)
  if (req.url.includes("/authentication/sign-in") || req.url.includes("/authentication/sign-up")) {
    return next(req)
  }

  // Añadir token a la solicitud si existe
  const token = authService.getToken()
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Manejar errores de autenticación
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido
        authService.logout()
        router.navigate(["/login"], {
          queryParams: { returnUrl: router.url, error: "Su sesión ha expirado. Por favor, inicie sesión nuevamente." },
        })
      }
      return throwError(() => error)
    }),
  )
}
