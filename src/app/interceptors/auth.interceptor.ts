import  { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError, throwError } from "rxjs"
import { AuthService } from "../services/auth.service"
import { Router } from "@angular/router"

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
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

    // Log para depuración
    console.log(`Añadiendo token a solicitud: ${req.url}`)
  } else {
    console.warn(`No hay token disponible para la solicitud: ${req.url}`)
  }

  // Manejar errores de autenticación
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error("Error 401: Token inválido o expirado", error)

        // Solo redirigir al login si no estamos ya en la página de login
        if (!router.url.includes("/login")) {
          authService.logout()
          router.navigate(["/login"], {
            queryParams: {
              returnUrl: router.url,
              error: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
            },
          })
        }
      }
      return throwError(() => error)
    }),
  )
}
