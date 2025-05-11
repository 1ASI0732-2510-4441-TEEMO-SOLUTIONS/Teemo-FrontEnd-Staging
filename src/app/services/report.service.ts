import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { delay, map, tap } from "rxjs/operators"
import { environment } from "../../environments/environment"
import jsPDF from "jspdf"
// @ts-ignore
import autoTable from "jspdf-autotable"

export interface ShipmentReport {
  id: number
  shipmentId: string
  routeName: string
  departureDate: string
  arrivalDate: string
  totalTime: string
  distance: string
  vessel: string
  events: ShipmentEvent[]
  emissions: {
    co2: string
    nox: string
    sox: string
  }
}

export interface ShipmentEvent {
  timestamp: string
  type: string
  description: string
  location?: string
}

export interface RouteHistoryItem {
  id: number
  routeName: string
  originPort: string
  destinationPort: string
  departureDate: string
  arrivalDate: string
  vessel: string
  status: string
  distance: string
  emissions: string
}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/v1/reports`

  // Datos de ejemplo para reportes de envío
  private mockShipmentReports: ShipmentReport[] = [
    {
      id: 1,
      shipmentId: "SHP-2023-001",
      routeName: "Singapore to Rotterdam",
      departureDate: "2023-01-15T08:30:00Z",
      arrivalDate: "2023-02-20T14:45:00Z",
      totalTime: "36d 6h 15m",
      distance: "8,450 nm",
      vessel: "Pacific Voyager",
      events: [
        {
          timestamp: "2023-01-15T08:30:00Z",
          type: "Departure",
          description: "Vessel departed from Singapore port",
          location: "Singapore",
        },
        {
          timestamp: "2023-01-28T10:15:00Z",
          type: "Weather",
          description: "Encountered heavy storm, reduced speed",
          location: "Indian Ocean",
        },
        {
          timestamp: "2023-02-10T16:45:00Z",
          type: "Maintenance",
          description: "Minor engine maintenance performed",
          location: "Mediterranean Sea",
        },
        {
          timestamp: "2023-02-20T14:45:00Z",
          type: "Arrival",
          description: "Vessel arrived at Rotterdam port",
          location: "Rotterdam",
        },
      ],
      emissions: {
        co2: "1,250 tons",
        nox: "35 tons",
        sox: "12 tons",
      },
    },
    {
      id: 2,
      shipmentId: "SHP-2023-002",
      routeName: "Shanghai to Los Angeles",
      departureDate: "2023-02-05T09:15:00Z",
      arrivalDate: "2023-03-10T11:30:00Z",
      totalTime: "33d 2h 15m",
      distance: "6,250 nm",
      vessel: "Asian Explorer",
      events: [
        {
          timestamp: "2023-02-05T09:15:00Z",
          type: "Departure",
          description: "Vessel departed from Shanghai port",
          location: "Shanghai",
        },
        {
          timestamp: "2023-02-18T14:30:00Z",
          type: "Weather",
          description: "Favorable winds, increased speed",
          location: "Pacific Ocean",
        },
        {
          timestamp: "2023-03-01T07:45:00Z",
          type: "Incident",
          description: "Minor collision with floating debris",
          location: "North Pacific",
        },
        {
          timestamp: "2023-03-10T11:30:00Z",
          type: "Arrival",
          description: "Vessel arrived at Los Angeles port",
          location: "Los Angeles",
        },
      ],
      emissions: {
        co2: "980 tons",
        nox: "28 tons",
        sox: "9 tons",
      },
    },
    {
      id: 3,
      shipmentId: "SHP-2023-003",
      routeName: "New York to Southampton",
      departureDate: "2023-03-20T12:00:00Z",
      arrivalDate: "2023-04-05T16:30:00Z",
      totalTime: "16d 4h 30m",
      distance: "3,400 nm",
      vessel: "Atlantic Carrier",
      events: [
        {
          timestamp: "2023-03-20T12:00:00Z",
          type: "Departure",
          description: "Vessel departed from New York port",
          location: "New York",
        },
        {
          timestamp: "2023-03-25T08:15:00Z",
          type: "Weather",
          description: "Rough seas, reduced speed",
          location: "North Atlantic",
        },
        {
          timestamp: "2023-04-01T19:45:00Z",
          type: "Maintenance",
          description: "Routine equipment check",
          location: "North Atlantic",
        },
        {
          timestamp: "2023-04-05T16:30:00Z",
          type: "Arrival",
          description: "Vessel arrived at Southampton port",
          location: "Southampton",
        },
      ],
      emissions: {
        co2: "620 tons",
        nox: "18 tons",
        sox: "6 tons",
      },
    },
  ]

  // Datos de ejemplo para historial de rutas
  private mockRouteHistory: RouteHistoryItem[] = [
    {
      id: 1,
      routeName: "Singapore to Rotterdam",
      originPort: "Singapore",
      destinationPort: "Rotterdam",
      departureDate: "2023-01-15",
      arrivalDate: "2023-02-20",
      vessel: "Pacific Voyager",
      status: "Completed",
      distance: "8,450 nm",
      emissions: "1,250 tons CO2",
    },
    {
      id: 2,
      routeName: "Shanghai to Los Angeles",
      originPort: "Shanghai",
      destinationPort: "Los Angeles",
      departureDate: "2023-02-05",
      arrivalDate: "2023-03-10",
      vessel: "Asian Explorer",
      status: "Completed",
      distance: "6,250 nm",
      emissions: "980 tons CO2",
    },
    {
      id: 3,
      routeName: "New York to Southampton",
      originPort: "New York",
      destinationPort: "Southampton",
      departureDate: "2023-03-20",
      arrivalDate: "2023-04-05",
      vessel: "Atlantic Carrier",
      status: "Completed",
      distance: "3,400 nm",
      emissions: "620 tons CO2",
    },
    {
      id: 4,
      routeName: "Dubai to Mumbai",
      originPort: "Dubai",
      destinationPort: "Mumbai",
      departureDate: "2023-04-10",
      arrivalDate: "2023-04-18",
      vessel: "Arabian Star",
      status: "Completed",
      distance: "1,200 nm",
      emissions: "320 tons CO2",
    },
    {
      id: 5,
      routeName: "Rotterdam to New York",
      originPort: "Rotterdam",
      destinationPort: "New York",
      departureDate: "2023-05-05",
      arrivalDate: "2023-05-22",
      vessel: "European Voyager",
      status: "Completed",
      distance: "3,500 nm",
      emissions: "630 tons CO2",
    },
    {
      id: 6,
      routeName: "Los Angeles to Tokyo",
      originPort: "Los Angeles",
      destinationPort: "Tokyo",
      departureDate: "2023-06-10",
      arrivalDate: "2023-07-05",
      vessel: "Pacific Explorer",
      status: "Completed",
      distance: "5,500 nm",
      emissions: "850 tons CO2",
    },
  ]

  constructor(private http: HttpClient) {}

  getShipmentReports(): Observable<ShipmentReport[]> {
    // En un entorno real, esto haría una llamada HTTP al backend
    return of(this.mockShipmentReports).pipe(
      delay(800), // Simular latencia de red
    )
  }

  getShipmentReportById(id: number): Observable<ShipmentReport | undefined> {
    // En un entorno real, esto haría una llamada HTTP al backend
    const report = this.mockShipmentReports.find((r) => r.id === id)
    return of(report).pipe(
      delay(500), // Simular latencia de red
    )
  }

  getRouteHistory(filters?: any): Observable<RouteHistoryItem[]> {
    // En un entorno real, esto haría una llamada HTTP al backend con filtros
    let filteredHistory = [...this.mockRouteHistory]

    // Aplicar filtros si existen
    if (filters) {
      if (filters.startDate && filters.endDate) {
        filteredHistory = filteredHistory.filter(
          (item) =>
            new Date(item.departureDate) >= new Date(filters.startDate) &&
            new Date(item.departureDate) <= new Date(filters.endDate),
        )
      }

      if (filters.destination) {
        filteredHistory = filteredHistory.filter((item) =>
          item.destinationPort.toLowerCase().includes(filters.destination.toLowerCase()),
        )
      }

      if (filters.vessel) {
        filteredHistory = filteredHistory.filter((item) =>
          item.vessel.toLowerCase().includes(filters.vessel.toLowerCase()),
        )
      }
    }

    return of(filteredHistory).pipe(
      delay(800), // Simular latencia de red
    )
  }

  downloadReportPdf(reportId: number): Observable<boolean> {
    // Find the report data
    return of(this.mockShipmentReports.find((report) => report.id === reportId)).pipe(
      delay(500), // Simulate a brief loading time
      tap((report) => {
        if (!report) {
          throw new Error("Report not found")
        }

        // Generate the PDF
        this.generatePdf(report)
      }),
      map(() => true),
    )
  }

  private generatePdf(report: ShipmentReport): void {
    // Create a new PDF document
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Add company logo/header
    doc.setFontSize(20)
    doc.setTextColor(10, 108, 188) // Primary blue color
    doc.text("Maritime Route Management", pageWidth / 2, 15, { align: "center" })

    // Add report title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("Informe de Envío", pageWidth / 2, 25, { align: "center" })

    // Add report ID and basic info
    doc.setFontSize(12)
    doc.text(`ID de Envío: ${report.shipmentId}`, 14, 35)
    doc.text(`Ruta: ${report.routeName}`, 14, 42)
    doc.text(`Embarcación: ${report.vessel}`, 14, 49)

    // Add dates and timing information
    doc.setFontSize(11)
    doc.text(`Fecha de Salida: ${this.formatDate(report.departureDate)}`, 14, 60)
    doc.text(`Fecha de Llegada: ${this.formatDate(report.arrivalDate)}`, 14, 67)
    doc.text(`Tiempo Total: ${report.totalTime}`, 14, 74)
    doc.text(`Distancia: ${report.distance}`, 14, 81)

    // Add events table
    doc.setFontSize(14)
    doc.text("Eventos del Viaje", 14, 95)

    // Create events table
    const tableColumn = ["Fecha", "Tipo", "Descripción", "Ubicación"]
    const tableRows = report.events.map((event) => [
      this.formatDate(event.timestamp),
      event.type,
      event.description,
      event.location || "",
    ])
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [10, 108, 188] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })

    // Add emissions information
    // Obtener la posición Y después de la tabla
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 130
    doc.setFontSize(14)
    doc.text("Emisiones Estimadas", 14, finalY)

    doc.setFontSize(11)
    doc.text(`CO2: ${report.emissions.co2}`, 14, finalY + 10)
    doc.text(`NOx: ${report.emissions.nox}`, 14, finalY + 17)
    doc.text(`SOx: ${report.emissions.sox}`, 14, finalY + 24)

    // Add footer
    const pageWidthFooter = doc.internal.pageSize.width
    // Usar una aserción de tipo para acceder a getNumberOfPages
    const docWithPages = doc as unknown as {
      internal: { getNumberOfPages: () => number; pageSize: { height: number } }
    }
    const pageCount = docWithPages.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text(
        `Generado el ${new Date().toLocaleString()} - Página ${i} de ${pageCount}`,
        pageWidthFooter - 15,
        docWithPages.internal.pageSize.height - 10,
        { align: "right" },
      )
    }

    // Download the PDF
    doc.save(`Informe-${report.shipmentId}.pdf`)
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
