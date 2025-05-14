import { Injectable } from "@angular/core"
import { HttpClient, type HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Observable, of } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { environment } from "../../environments/environment"
import { AuthService } from "./auth.service"

export interface Port {
  id: number
  name: string
  latitude: number
  longitude: number
  continent: string
}

@Injectable({
  providedIn: "root",
})
export class PortService {
  private apiUrl = `${environment.apiUrl}/api/v1/ports`

  // Datos de respaldo en caso de que la API falle
  private fallbackPorts: Port[] = [
    {
      id: 1,
      name: "Singapore",
      latitude: 1.29027,
      longitude: 103.851959,
      continent: "Asia",
    },
    {
      id: 2,
      name: "Rotterdam",
      latitude: 51.905445,
      longitude: 4.466637,
      continent: "Europe",
    },
    {
      id: 3,
      name: "Shanghai",
      latitude: 31.224361,
      longitude: 121.46917,
      continent: "Asia",
    },
    {
      id: 4,
      name: "Los Angeles",
      latitude: 33.77005,
      longitude: -118.193741,
      continent: "North America",
    },
    {
      id: 5,
      name: "New York",
      latitude: 40.73061,
      longitude: -73.935242,
      continent: "North America",
    },
    {
      id: 6,
      name: "Southampton",
      latitude: 50.909698,
      longitude: -1.404351,
      continent: "Europe",
    },
    {
      id: 7,
      name: "Dubai",
      latitude: 25.276987,
      longitude: 55.296249,
      continent: "Asia",
    },
    {
      id: 8,
      name: "Mumbai",
      latitude: 19.07609,
      longitude: 72.877426,
      continent: "Asia",
    },
    {
      id: 9,
      name: "Sydney",
      latitude: -33.865143,
      longitude: 151.2099,
      continent: "Oceania",
    },
    {
      id: 10,
      name: "Cape Town",
      latitude: -33.918861,
      longitude: 18.4233,
      continent: "Africa",
    },
  ]

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getAllPorts(): Observable<Port[]> {
    console.log("Obteniendo puertos desde:", this.apiUrl)

    // Obtener el token de autenticación
    const token = this.authService.getToken()

    // Configurar los headers con el token de autenticación
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    })

    // Intentar obtener los puertos del backend con los headers de autenticación
    return this.http.get<Port[]>(this.apiUrl, { headers }).pipe(
      tap((ports) => {
        console.log("Puertos obtenidos del backend:", ports)
      }),
      catchError((error: HttpErrorResponse) => {
        console.error("Error al obtener puertos del backend:", error)

        if (error.status === 401) {
          console.warn("Error de autenticación (401) al obtener puertos. Verificar token.")
        }

        // Si hay un error, devolver los puertos de respaldo
        console.log("Usando puertos de respaldo debido a error:", error.status)
        return of(this.fallbackPorts)
      }),
    )
  }

  // Método para obtener un puerto específico por ID
  getPortById(id: number): Observable<Port | undefined> {
    // Primero intentamos obtener del backend
    return this.http.get<Port>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al obtener puerto con ID ${id}:`, error)

        // Si hay un error, buscamos en los datos de respaldo
        const fallbackPort = this.fallbackPorts.find((port) => port.id === id)
        return of(fallbackPort)
      }),
    )
  }

  // Método para buscar puertos por nombre o continente
  searchPorts(term: string): Observable<Port[]> {
    if (!term.trim()) {
      // Si no hay término de búsqueda, devolver todos los puertos
      return this.getAllPorts()
    }

    const searchTerm = term.toLowerCase()

    // Intentar buscar en el backend
    return this.http.get<Port[]>(`${this.apiUrl}/search?term=${searchTerm}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al buscar puertos con término "${term}":`, error)

        // Si hay un error, buscar en los datos de respaldo
        const filteredPorts = this.fallbackPorts.filter(
          (port) => port.name.toLowerCase().includes(searchTerm) || port.continent.toLowerCase().includes(searchTerm),
        )
        return of(filteredPorts)
      }),
    )
  }
}
