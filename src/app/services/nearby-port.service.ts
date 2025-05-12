import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, of } from "rxjs"
import { delay } from "rxjs/operators"
import { environment } from "../../environments/environment"

export interface NearbyPort {
  id: number
  name: string
  country: string
  latitude: number
  longitude: number
  distance: number
  status: "open" | "closed"
  facilities: string[]
  maxDepth: number
  contactInfo: {
    phone: string
    email: string
    vhfChannel: string
  }
}

@Injectable({
  providedIn: "root",
})
export class NearbyPortService {
  private apiUrl = `${environment.apiUrl}/api/v1/ports`

  // Datos de ejemplo para puertos cercanos
  private mockNearbyPorts: NearbyPort[] = [
    {
      id: 1,
      name: "Singapore Port",
      country: "Singapore",
      latitude: 1.29027,
      longitude: 103.851959,
      distance: 25.4,
      status: "open",
      facilities: ["Fuel", "Repairs", "Medical", "Supplies"],
      maxDepth: 16,
      contactInfo: {
        phone: "+65 1234 5678",
        email: "operations@singaporeport.com",
        vhfChannel: "12, 14",
      },
    },
    {
      id: 2,
      name: "Johor Port",
      country: "Malaysia",
      latitude: 1.43,
      longitude: 103.9,
      distance: 42.8,
      status: "open",
      facilities: ["Fuel", "Supplies"],
      maxDepth: 14,
      contactInfo: {
        phone: "+60 7654 3210",
        email: "info@johorport.my",
        vhfChannel: "16",
      },
    },
    {
      id: 3,
      name: "Batam Port",
      country: "Indonesia",
      latitude: 1.13,
      longitude: 104.05,
      distance: 58.2,
      status: "closed",
      facilities: ["Repairs", "Supplies"],
      maxDepth: 12,
      contactInfo: {
        phone: "+62 8765 4321",
        email: "contact@batamport.id",
        vhfChannel: "14",
      },
    },
  ]

  constructor(private http: HttpClient) {}

  getNearbyPorts(latitude: number, longitude: number, radius = 100): Observable<NearbyPort[]> {
    // En un entorno real, esto haría una llamada HTTP al backend con las coordenadas
    // Por ahora, devolvemos los datos de ejemplo
    return of(this.mockNearbyPorts).pipe(
      delay(800), // Simular latencia de red
    )
  }

  getCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    // En un entorno real, esto podría obtener la ubicación actual del dispositivo
    // o de un sistema de seguimiento de la embarcación
    return of({
      latitude: 1.35,
      longitude: 103.8,
    }).pipe(
      delay(500), // Simular latencia
    )
  }
}
