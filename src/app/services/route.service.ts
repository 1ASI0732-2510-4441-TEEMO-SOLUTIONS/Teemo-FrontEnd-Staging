import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { environment } from "../../environments/environment"

export interface RoutePort {
  id: number
  name: string
}

export interface Route {
  id: number
  name: string
  status: string
  vessels: number
  distance: string
  eta: string
  originPortId?: number
  destinationPortId?: number
  departureDate?: string
  ports?: RoutePort[]
}

export interface CreateRouteRequest {
  name: string
  from: string
  to: string
  vessels: number
  departureDate: string
  status: string
}

export interface RoutePlanResult {
  route: string[]
  message: string
  name?: string
  distance?: number
  vessels?: number
  departureDate?: string
  eta?: string
  status?: string
}

@Injectable({
  providedIn: "root",
})
export class RouteService {
  private apiUrl = `${environment.apiUrl}/api/v1/routes`

  constructor(private http: HttpClient) {}

  // GET /api/v1/routes/find
  findRoute(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/find?from=${from}&to=${to}`).pipe(catchError(this.handleError))
  }

  // GET /api/v1/routes/ports
  getRoutePorts(): Observable<RoutePort[]> {
    return this.http.get<RoutePort[]>(`${this.apiUrl}/ports`).pipe(catchError(this.handleError))
  }

  // POST /api/v1/routes/plan
  planRoute(routeData: CreateRouteRequest): Observable<RoutePlanResult> {
    return this.http.post<RoutePlanResult>(`${this.apiUrl}/plan`, routeData).pipe(catchError(this.handleError))
  }

  // Get route by ID (assuming you'll add this endpoint)
  getRouteById(routeId: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${routeId}`).pipe(catchError(this.handleError))
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = "An unknown error occurred"

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = "Could not connect to the server. Please check your internet connection."
      } else if (error.status === 404) {
        errorMessage = "The requested route could not be found."
      } else if (error.status === 400) {
        errorMessage = error.error?.message || "Invalid request. Please check your input."
      } else if (error.status === 500) {
        errorMessage = error.error?.message || "Server error. Please try again later."
      } else {
        errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`
      }
    }

    console.error("Route service error:", error)
    return throwError(() => new Error(errorMessage))
  }
}
