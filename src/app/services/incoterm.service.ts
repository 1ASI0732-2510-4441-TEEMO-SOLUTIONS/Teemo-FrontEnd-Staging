import { Injectable } from "@angular/core"
import { type Observable, of } from "rxjs"
import { delay } from "rxjs/operators"

export interface IncotermFormData {
  cargoType: string
  cargoValue: number
  cargoWeight: number
  cargoVolume: number
  seller: string
  buyer: string
  sellerCountry: string
  buyerCountry: string
  paymentTerms: string
  experienceLevel: string
  insurance: boolean
  specialRequirements: string
}

export interface IncotermOption {
  code: string
  name: string
  description: string
  sellerResponsibilities: string[]
  buyerResponsibilities: string[]
  recommendationScore: number
  costBreakdown: {
    freight: number
    insurance: number
    customsClearance: number
    portHandling: number
    documentation: number
    total: number
  }
}

export interface IncotermCalculationResult {
  recommendedIncoterm: IncotermOption
  alternatives: IncotermOption[]
  routeDetails: {
    distance: number
    estimatedTime: string
    riskLevel: string
  }
  warnings: string[]
}

@Injectable({
  providedIn: "root",
})
export class IncotermService {
  constructor() {}

  calculateIncoterms(
    formData: IncotermFormData,
    originPort: string,
    destinationPort: string,
    distance: number,
  ): Observable<IncotermCalculationResult> {
    // Simulamos un cálculo basado en los datos proporcionados
    const result = this.generateIncotermRecommendation(formData, originPort, destinationPort, distance)

    // Simulamos un delay para imitar una llamada a API
    return of(result).pipe(delay(1500))
  }

  private generateIncotermRecommendation(
    formData: IncotermFormData,
    originPort: string,
    destinationPort: string,
    distance: number,
  ): IncotermCalculationResult {
    // Calculamos costos base basados en distancia y valor de carga
    const baseFreight = Math.round(distance * 0.05)
    const baseInsurance = Math.round(formData.cargoValue * 0.02)
    const baseCustoms = Math.round(formData.cargoValue * 0.03)
    const baseHandling = Math.round(formData.cargoWeight * 2 + formData.cargoVolume * 10)
    const baseDocumentation = 250

    // Calculamos puntuaciones para diferentes Incoterms
    const cifScore = this.calculateCIFScore(formData)
    const fobScore = this.calculateFOBScore(formData)
    const cfrScore = this.calculateCFRScore(formData)

    // Creamos opciones de Incoterms
    const cifOption: IncotermOption = {
      code: "CIF",
      name: "Cost, Insurance and Freight",
      description: "El vendedor paga el costo, seguro y flete hasta el puerto de destino designado.",
      sellerResponsibilities: [
        "Entrega de mercancía",
        "Embalaje y verificación",
        "Transporte interior en origen",
        "Formalidades aduaneras de exportación",
        "Carga en puerto de origen",
        "Transporte principal (flete marítimo)",
        "Seguro de la mercancía",
      ],
      buyerResponsibilities: [
        "Descarga en puerto de destino",
        "Formalidades aduaneras de importación",
        "Transporte interior en destino",
        "Recepción de la mercancía",
      ],
      recommendationScore: cifScore,
      costBreakdown: {
        freight: baseFreight,
        insurance: baseInsurance,
        customsClearance: 0,
        portHandling: Math.round(baseHandling * 0.5),
        documentation: baseDocumentation,
        total: baseFreight + baseInsurance + Math.round(baseHandling * 0.5) + baseDocumentation,
      },
    }

    const fobOption: IncotermOption = {
      code: "FOB",
      name: "Free On Board",
      description: "El vendedor entrega la mercancía a bordo del buque designado por el comprador.",
      sellerResponsibilities: [
        "Entrega de mercancía",
        "Embalaje y verificación",
        "Transporte interior en origen",
        "Formalidades aduaneras de exportación",
        "Carga en puerto de origen",
      ],
      buyerResponsibilities: [
        "Transporte principal (flete marítimo)",
        "Seguro de la mercancía",
        "Descarga en puerto de destino",
        "Formalidades aduaneras de importación",
        "Transporte interior en destino",
        "Recepción de la mercancía",
      ],
      recommendationScore: fobScore,
      costBreakdown: {
        freight: 0,
        insurance: 0,
        customsClearance: 0,
        portHandling: Math.round(baseHandling * 0.3),
        documentation: baseDocumentation,
        total: Math.round(baseHandling * 0.3) + baseDocumentation,
      },
    }

    const cfrOption: IncotermOption = {
      code: "CFR",
      name: "Cost and Freight",
      description: "El vendedor paga el costo y flete hasta el puerto de destino designado.",
      sellerResponsibilities: [
        "Entrega de mercancía",
        "Embalaje y verificación",
        "Transporte interior en origen",
        "Formalidades aduaneras de exportación",
        "Carga en puerto de origen",
        "Transporte principal (flete marítimo)",
      ],
      buyerResponsibilities: [
        "Seguro de la mercancía",
        "Descarga en puerto de destino",
        "Formalidades aduaneras de importación",
        "Transporte interior en destino",
        "Recepción de la mercancía",
      ],
      recommendationScore: cfrScore,
      costBreakdown: {
        freight: baseFreight,
        insurance: 0,
        customsClearance: 0,
        portHandling: Math.round(baseHandling * 0.4),
        documentation: baseDocumentation,
        total: baseFreight + Math.round(baseHandling * 0.4) + baseDocumentation,
      },
    }

    // Determinamos el Incoterm recomendado
    let recommendedIncoterm: IncotermOption
    let alternatives: IncotermOption[] = []

    const scores = [
      { incoterm: cifOption, score: cifScore },
      { incoterm: fobOption, score: fobScore },
      { incoterm: cfrOption, score: cfrScore },
    ]

    scores.sort((a, b) => b.score - a.score)
    recommendedIncoterm = scores[0].incoterm
    alternatives = [scores[1].incoterm, scores[2].incoterm]

    // Generamos advertencias basadas en los datos
    const warnings: string[] = []
    if (formData.cargoValue > 100000) {
      warnings.push("Carga de alto valor: Se recomienda seguro adicional.")
    }
    if (formData.specialRequirements.toLowerCase().includes("peligros")) {
      warnings.push("Carga peligrosa: Verifique regulaciones especiales de transporte.")
    }
    if (distance > 8000) {
      warnings.push("Ruta de larga distancia: Considere tiempos de tránsito extendidos.")
    }

    // Calculamos tiempo estimado basado en distancia (aproximado)
    const days = Math.round(distance / 350) // ~350 millas náuticas por día
    const estimatedTime = `${days} días`

    // Determinamos nivel de riesgo basado en distancia y tipo de carga
    let riskLevel = "Bajo"
    if (distance > 5000 || formData.cargoValue > 50000) {
      riskLevel = "Medio"
    }
    if (
      distance > 8000 ||
      formData.cargoValue > 100000 ||
      formData.specialRequirements.toLowerCase().includes("peligros")
    ) {
      riskLevel = "Alto"
    }

    return {
      recommendedIncoterm,
      alternatives,
      routeDetails: {
        distance,
        estimatedTime,
        riskLevel,
      },
      warnings,
    }
  }

  private calculateCIFScore(formData: IncotermFormData): number {
    let score = 70 // Puntuación base

    // CIF es mejor para compradores con poca experiencia
    if (formData.experienceLevel === "principiante") score += 20
    if (formData.experienceLevel === "intermedio") score += 10

    // CIF es mejor cuando el seguro es importante
    if (formData.insurance) score += 15

    // CIF es mejor para cargas de alto valor
    if (formData.cargoValue > 50000) score += 10

    return score
  }

  private calculateFOBScore(formData: IncotermFormData): number {
    let score = 60 // Puntuación base

    // FOB es mejor para compradores con experiencia
    if (formData.experienceLevel === "experto") score += 25
    if (formData.experienceLevel === "intermedio") score += 15

    // FOB es mejor cuando el comprador quiere controlar el transporte
    if (formData.paymentTerms === "carta_credito") score += 10

    // FOB es mejor para cargas de menor valor
    if (formData.cargoValue < 50000) score += 10

    return score
  }

  private calculateCFRScore(formData: IncotermFormData): number {
    let score = 65 // Puntuación base

    // CFR es un punto intermedio
    if (formData.experienceLevel === "intermedio") score += 20
    if (formData.experienceLevel === "experto") score += 10

    // CFR es bueno cuando el seguro no es tan importante
    if (!formData.insurance) score += 15

    // CFR es bueno para cargas de valor medio
    if (formData.cargoValue >= 10000 && formData.cargoValue <= 50000) score += 15

    return score
  }
}
