import { Injectable } from "@angular/core"
import {  Observable, combineLatest, of } from "rxjs"
import { map, catchError, switchMap } from "rxjs/operators"
import  { MaritimeRoutingService, MaritimeRoute } from "./maritime-routing.service"

export interface EnhancedRouteData {
  id: string
  origin: string
  destination: string
  distance: number
  estimatedTime: number
  status: "active" | "completed" | "delayed"
  warnings: string[]
  maritimeRoute?: MaritimeRoute
}

@Injectable({
  providedIn: "root",
})
export class EnhancedRouteService {
  constructor(private maritimeRoutingService: MaritimeRoutingService) {}

  public enhanceRoute(backendRoute: any): Observable<EnhancedRouteData | MaritimeRoute> {
    // Verificar si el servicio marítimo está listo
    return this.maritimeRoutingService.isServiceReady().pipe(
      switchMap((isReady) => {
        if (!isReady) {
          console.warn("Servicio marítimo no disponible, retornando datos básicos")
          return of(this.createEnhancedRouteData(backendRoute, "Servicio marítimo no disponible"))
        }

        // Extraer coordenadas del backend
        const coordinates = this.extractCoordinates(backendRoute)
        if (!coordinates) {
          console.warn("No se pudieron extraer coordenadas, retornando ruta del backend")
          return of(this.createEnhancedRouteData(backendRoute, "Coordenadas no disponibles"))
        }

        const { start, end } = coordinates

        // Combinar datos del backend con ruta marítima
        return combineLatest([of(backendRoute), this.maritimeRoutingService.calculateMaritimeRoute(start, end)]).pipe(
          map(([backend, maritime]) => {
            if (this.isMaritimeRoute(maritime)) {
              return maritime
            }
            return this.createEnhancedRouteData(backend, "Error en cálculo marítimo")
          }),
          catchError((error) => {
            console.error("Error en enhanceRoute:", error)
            return of(this.createEnhancedRouteData(backendRoute, "Error en procesamiento"))
          }),
        )
      }),
    )
  }

  private extractCoordinates(route: any): { start: [number, number]; end: [number, number] } | null {
    try {
      // Intentar diferentes estructuras de datos del backend
      if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
        const start = route.coordinates[0]
        const end = route.coordinates[route.coordinates.length - 1]

        if (this.isValidCoordinate(start) && this.isValidCoordinate(end)) {
          return { start: [start[0], start[1]], end: [end[0], end[1]] }
        }
      }

      // Estructura alternativa: origin/destination
      if (route.origin && route.destination) {
        const start = this.parseCoordinate(route.origin)
        const end = this.parseCoordinate(route.destination)

        if (start && end) {
          return { start, end }
        }
      }

      // Estructura alternativa: startPort/endPort
      if (route.startPort && route.endPort) {
        const start = this.parsePortCoordinate(route.startPort)
        const end = this.parsePortCoordinate(route.endPort)

        if (start && end) {
          return { start, end }
        }
      }

      return null
    } catch (error) {
      console.error("Error extrayendo coordenadas:", error)
      return null
    }
  }

  private isValidCoordinate(coord: any): boolean {
    return (
      Array.isArray(coord) &&
      coord.length >= 2 &&
      typeof coord[0] === "number" &&
      typeof coord[1] === "number" &&
      coord[0] >= -180 &&
      coord[0] <= 180 &&
      coord[1] >= -90 &&
      coord[1] <= 90
    )
  }

  private parseCoordinate(coord: any): [number, number] | null {
    if (this.isValidCoordinate(coord)) {
      return [coord[0], coord[1]]
    }

    if (coord && typeof coord === "object") {
      if (typeof coord.lng === "number" && typeof coord.lat === "number") {
        return [coord.lng, coord.lat]
      }
      if (typeof coord.longitude === "number" && typeof coord.latitude === "number") {
        return [coord.longitude, coord.latitude]
      }
    }

    return null
  }

  private parsePortCoordinate(port: any): [number, number] | null {
    if (!port || typeof port !== "object") return null

    // Buscar coordenadas en diferentes propiedades
    const coords = port.coordinates || port.location || port.position
    return this.parseCoordinate(coords)
  }

  private isMaritimeRoute(obj: any): obj is MaritimeRoute {
    return (
      obj &&
      typeof obj === "object" &&
      Array.isArray(obj.coordinates) &&
      typeof obj.distance === "number" &&
      typeof obj.estimatedTime === "number" &&
      Array.isArray(obj.warnings) &&
      Array.isArray(obj.waypoints)
    )
  }

  private createEnhancedRouteData(backendRoute: any, warning: string): EnhancedRouteData {
    return {
      id: backendRoute.id || "unknown",
      origin: backendRoute.origin || "Puerto de origen",
      destination: backendRoute.destination || "Puerto de destino",
      distance: backendRoute.distance || 0,
      estimatedTime: backendRoute.estimatedTime || 0,
      status: backendRoute.status || "active",
      warnings: [warning],
      maritimeRoute: undefined,
    }
  }
}
