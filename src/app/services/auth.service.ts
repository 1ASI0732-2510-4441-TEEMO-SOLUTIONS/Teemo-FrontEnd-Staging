import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { Router } from "@angular/router"
import { environment } from "../../environments/environment"

export interface User {
  id: string
  username: string
  name?: string
  email?: string
  role?: string
  roles?: string[]
  token?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  id: string
  username: string
  token: string
}

export interface SignUpRequest {
  username: string
  password: string
  roles: string[]
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // Cambiamos la URL para que coincida con el backend
  private apiUrl = `${environment.apiUrl}/api/v1/authentication`
  private tokenKey = "maritime_auth_token"
  private userKey = "maritime_user"
  private currentUserSubject: BehaviorSubject<User | null>
  public currentUser: Observable<User | null>

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Intentar recuperar el usuario del almacenamiento local al iniciar
    const storedUser = localStorage.getItem(this.userKey)
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.getToken()
  }

  login(credentials: LoginRequest): Observable<User> {
    // Llamada al endpoint de inicio de sesión del backend
    return this.http.post<LoginResponse>(`${this.apiUrl}/sign-in`, credentials).pipe(
      map((response) => {
        // Extraer el usuario y el token de la respuesta
        const user: User = {
          id: response.id,
          username: response.username,
          // Si el backend no proporciona un nombre, usar el username
          name: response.username,
          // Asignar un rol predeterminado
          role: "Usuario",
          token: response.token,
        }

        // Guardar token y usuario
        this.setToken(response.token)
        this.setUser(user)
        this.currentUserSubject.next(user)
        return user
      }),
      catchError((error) => {
        console.error("Error durante el inicio de sesión:", error)
        let errorMessage = "Error de inicio de sesión"

        if (error.error && error.error.message) {
          errorMessage = error.error.message
        } else if (error.status === 401) {
          errorMessage = "Credenciales inválidas"
        } else if (error.status === 403) {
          errorMessage = "No tiene permisos para acceder"
        } else if (error.status === 0) {
          errorMessage = "No se pudo conectar al servidor. Verifique su conexión a internet."
        }

        return throwError(() => new Error(errorMessage))
      }),
    )
  }

  // Modificar el método register para manejar mejor los errores
  register(signUpRequest: SignUpRequest): Observable<User> {
    // Llamada al endpoint de registro del backend
    return this.http.post<User>(`${this.apiUrl}/sign-up`, signUpRequest).pipe(
      catchError((error) => {
        console.error("Error durante el registro:", error)
        let errorMessage = "Error de registro"

        if (error.error && error.error.message) {
          errorMessage = error.error.message
        } else if (error.status === 400) {
          errorMessage = "Datos de registro inválidos"
        } else if (error.status === 409) {
          errorMessage = "El nombre de usuario ya existe"
        } else if (error.status === 401) {
          errorMessage = "No se pudo registrar el usuario. El endpoint requiere autenticación."
        } else if (error.status === 0) {
          errorMessage = "No se pudo conectar al servidor. Verifique su conexión a internet."
        }

        return throwError(() => new Error(errorMessage))
      }),
    )
  }

  logout(): void {
    // Eliminar token y usuario del almacenamiento
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  private getRoleFromRoles(roles: string[]): string {
    // Prioridad de roles (de mayor a menor)
    const rolePriority = ["ADMIN", "CAPTAIN", "USER"]

    // Convertir todos los roles a mayúsculas para comparación
    const upperRoles = roles.map((role) => role.toUpperCase())

    // Buscar el rol de mayor prioridad
    for (const role of rolePriority) {
      if (upperRoles.includes(role)) {
        return this.formatRoleName(role)
      }
    }

    // Si no hay coincidencias, devolver el primer rol o "Usuario" por defecto
    return roles.length > 0 ? this.formatRoleName(roles[0]) : "Usuario"
  }

  // Método para formatear el nombre del rol (primera letra mayúscula, resto minúsculas)
  private formatRoleName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  }

  // Verificar si el token ha expirado
  isTokenExpired(): boolean {
    const token = this.getToken()
    if (!token) return true

    // Si el backend usa JWT, podríamos decodificar el token y verificar su fecha de expiración
    // Por ahora, asumimos que el token es válido
    return false
  }
}
