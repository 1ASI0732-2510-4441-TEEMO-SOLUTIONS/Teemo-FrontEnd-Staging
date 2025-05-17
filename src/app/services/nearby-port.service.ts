import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, of } from "rxjs"
import { catchError } from "rxjs/operators"
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
  private apiUrl = `${environment.apiUrl}/api/v1`

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Observable<{ latitude: number; longitude: number }> {
    // En una aplicación real, esto podría obtener la ubicación del GPS o de un servicio de rastreo
    // Para este ejemplo, devolvemos una ubicación fija o simulada
    return of({ latitude: 1.29027, longitude: 103.851959 }) // Singapore como ubicación predeterminada
  }

  getNearbyPorts(vesselId: string): Observable<NearbyPort[]> {
    return this.http.get<NearbyPort[]>(`${this.apiUrl}/vessels/${vesselId}/nearby-ports`).pipe(
      catchError((error) => {
        console.error("Error al obtener puertos cercanos:", error)
        // Devolver datos de ejemplo en caso de error
        return of(this.getFallbackNearbyPorts())
      }),
    )
  }

  private getFallbackNearbyPorts(): NearbyPort[] {
    return [
      {
        id: 1,
        name: "Puerto de Singapore",
        country: "Asia",
        latitude: 1.29027,
        longitude: 103.851959,
        distance: 0,
        status: "open",
        facilities: ["Fuel", "Repairs", "Medical", "Supplies"],
        maxDepth: 15,
        contactInfo: {
          phone: "+65 1234 5678",
          email: "port@singapore.com",
          vhfChannel: "16",
        },
      },
      {
        id: 2,
        name: "Puerto de Johor",
        country: "Asia",
        latitude: 1.4655,
        longitude: 103.7578,
        distance: 25.3,
        status: "open",
        facilities: ["Fuel", "Supplies"],
        maxDepth: 12,
        contactInfo: {
          phone: "+60 7123 4567",
          email: "port@johor.com",
          vhfChannel: "14",
        },
      },
      {
        id: 3,
        name: "Puerto de Batam",
        country: "Asia",
        latitude: 1.1301,
        longitude: 104.0529,
        distance: 32.7,
        status: "closed",
        facilities: ["Repairs", "Supplies"],
        maxDepth: 10,
        contactInfo: {
          phone: "+62 778 123456",
          email: "port@batam.com",
          vhfChannel: "12",
        },
      },
      {
        id: 4,
        name: "Puerto de Bintan",
        country: "Asia",
        latitude: 1.0619,
        longitude: 104.4165,
        distance: 45.8,
        status: "open",
        facilities: ["Fuel", "Customs"],
        maxDepth: 14,
        contactInfo: {
          phone: "+62 770 123456",
          email: "port@bintan.com",
          vhfChannel: "10",
        },
      },
      {
        id: 5,
        name: "Puerto de Kuala Lumpur",
        country: "Asia",
        latitude: 3.0738,
        longitude: 101.6881,
        distance: 180.2,
        status: "open",
        facilities: ["Fuel", "Repairs", "Medical", "Supplies", "Customs"],
        maxDepth: 18,
        contactInfo: {
          phone: "+60 3123 4567",
          email: "port@kl.com",
          vhfChannel: "16",
        },
      },
    ]
  }
}
