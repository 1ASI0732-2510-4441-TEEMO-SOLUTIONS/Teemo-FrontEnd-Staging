import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders, type HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map, tap } from "rxjs/operators"
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
  private apiUrl = `${environment.apiUrl}/api/v1`

  // Datos estáticos de puertos para usar mientras se resuelve el problema de autenticación
  private mockPorts: Port[] = [
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

  // Devolver datos estáticos en lugar de hacer una llamada HTTP
  getAllPorts(): Observable<Port[]> {
    const url = `${this.apiUrl}/routes/ports`
    console.log("Solicitando puertos desde:", url)

    // Añadir headers de autenticación
    const headers = new HttpHeaders({
      Authorization: "Bearer " + this.getAuthToken(),
    })

    return this.http.get<any[]>(url, { headers }).pipe(
      tap((response) => console.log("Respuesta del servidor:", response)),
      map((ports) => {
        // Mapear la respuesta al formato que esperamos
        return ports.map((port) => ({
          id: port.id || Math.random() * 1000, // Generar un ID si no viene
          name: port.name,
          latitude: port.lat,
          longitude: port.lng,
          continent: port.continent || "Desconocido",
        }))
      }),
      catchError(this.handleError),
    )
  }

  private getAuthToken(): string {
    // Intentar obtener el token del localStorage o sessionStorage
    const token = localStorage.getItem("maritime_token") || sessionStorage.getItem("maritime_token")
    return token || ""
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message)
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`)
    }
    // Return an observable with a user-facing error message.
    return throwError("Something bad happened; please try again later.")
  }
}
