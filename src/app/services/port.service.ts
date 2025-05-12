import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { environment } from "../../environments/environment"

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

  constructor(private http: HttpClient) {}

  getAllPorts(): Observable<Port[]> {
    // Intentar obtener los puertos del backend
    return this.http.get<Port[]>(this.apiUrl).pipe(
      tap((ports) => {
        console.log("Puertos obtenidos del backend:", ports)
      }),
      catchError((error: HttpErrorResponse) => {
        console.error("Error al obtener puertos del backend:", error)

        // Si hay un error de autenticación (401) o cualquier otro error,
        // devolver los puertos de respaldo
        console.log("Usando puertos de respaldo debido a error:", error.status)
        return of(this.fallbackPorts)
      }),
    )
  }
}
