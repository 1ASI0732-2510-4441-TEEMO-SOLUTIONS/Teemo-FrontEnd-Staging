import { Component, Input, Output, EventEmitter, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { GoogleAnalyticsService, SurveyResponse } from "../../../services/google-analytics.service"

interface SurveyQuestion {
  id: number
  text: string
  rating: number
}

@Component({
  selector: "app-survey-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Survey Content -->
        <div class="survey-content" *ngIf="!showThankYou">
          <div class="survey-header">
            <h2>Encuesta de Mejoras de la Plataforma</h2>
            <button class="close-btn" (click)="closeSurvey()" title="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="survey-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getProgressPercentage()"></div>
            </div>
            <span class="progress-text">{{ getCompletedQuestions() }} de {{ questions.length }} preguntas</span>
          </div>

          <div class="survey-body">
            <div class="survey-intro" *ngIf="!surveyStarted">
              <div class="intro-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <h3>Ayúdanos a mejorar</h3>
              <p>Tu opinión es muy importante para nosotros. Esta encuesta toma aproximadamente 2 minutos y nos ayudará a mejorar la plataforma.</p>
              <p class="rating-explanation">
                <strong>Escala de calificación:</strong><br>
                1 = Totalmente en desacuerdo<br>
                10 = Totalmente de acuerdo
              </p>
              <button class="start-survey-btn" (click)="startSurvey()">Comenzar Encuesta</button>
            </div>

            <div class="questions-container" *ngIf="surveyStarted">
              <div class="question-item" *ngFor="let question of questions; let i = index">
                <div class="question-header">
                  <span class="question-number">{{ i + 1 }}</span>
                  <h4 class="question-text">{{ question.text }}</h4>
                </div>

                <div class="rating-container">
                  <div class="rating-scale">
                    <button
                      *ngFor="let rating of [1,2,3,4,5,6,7,8,9,10]"
                      class="rating-btn"
                      [class.selected]="question.rating === rating"
                      (click)="setRating(question.id, rating)"
                      [title]="getRatingLabel(rating)"
                    >
                      {{ rating }}
                    </button>
                  </div>
                  <div class="rating-labels">
                    <span class="label-left">Totalmente en desacuerdo</span>
                    <span class="label-right">Totalmente de acuerdo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="survey-footer" *ngIf="surveyStarted">
            <div class="footer-info">
              <p class="completion-status" *ngIf="getCompletedQuestions() > 0">
                Has completado {{ getCompletedQuestions() }} de {{ questions.length }} preguntas
              </p>
            </div>
            <div class="footer-actions">
              <button class="cancel-btn" (click)="closeSurvey()">Cancelar</button>
              <button
                class="submit-btn"
                (click)="submitSurvey()"
                [disabled]="!isAllQuestionsAnswered()"
                [class.disabled]="!isAllQuestionsAnswered()"
              >
                Enviar Respuestas
              </button>
            </div>
          </div>
        </div>

        <!-- Thank You Content -->
        <div class="thank-you-content" *ngIf="showThankYou">
          <div class="thank-you-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <h2>¡Gracias por tu feedback!</h2>
          <p>Tus respuestas han sido registradas exitosamente.</p>
          <div class="survey-summary">
            <div class="summary-item">
              <span class="summary-label">Calificación promedio:</span>
              <span class="summary-value">{{ getAverageRating().toFixed(1) }}/10</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Preguntas respondidas:</span>
              <span class="summary-value">{{ questions.length }}</span>
            </div>
          </div>
          <button class="close-thank-you-btn" (click)="closeSurvey()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        animation: fadeIn 0.2s ease;
      }

      .modal-container {
        background-color: white;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        width: 100%;
        max-width: 700px;
        max-height: 90vh;
        overflow: hidden;
        animation: slideInUp 0.3s ease;
      }

      .survey-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e2e8f0;
        background-color: #f8fafc;
      }

      .survey-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        color: #6b7280;
        cursor: pointer;
        border-radius: 0.375rem;
        transition: all 150ms ease;
      }

      .close-btn:hover {
        background-color: #f3f4f6;
        color: #374151;
      }

      .survey-progress {
        padding: 1rem 2rem;
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background-color: #2563eb;
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      .progress-text {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }

      .survey-body {
        padding: 2rem;
        max-height: 60vh;
        overflow-y: auto;
      }

      .survey-intro {
        text-align: center;
        max-width: 500px;
        margin: 0 auto;
      }

      .intro-icon {
        margin-bottom: 1.5rem;
        color: #2563eb;
      }

      .survey-intro h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
      }

      .survey-intro p {
        margin: 0 0 1rem 0;
        color: #6b7280;
        line-height: 1.6;
      }

      .rating-explanation {
        background-color: #f0f9ff;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #2563eb;
        text-align: left !important;
        font-size: 0.875rem;
      }

      .start-survey-btn {
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 150ms ease;
        margin-top: 1.5rem;
      }

      .start-survey-btn:hover {
        background-color: #1d4ed8;
      }

      .questions-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .question-item {
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        padding: 1.5rem;
        background-color: #fafbfc;
      }

      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .question-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: #2563eb;
        color: white;
        border-radius: 50%;
        font-weight: 600;
        font-size: 0.875rem;
        flex-shrink: 0;
      }

      .question-text {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
        line-height: 1.5;
      }

      .rating-container {
        margin-left: 3rem;
      }

      .rating-scale {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }

      .rating-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 2px solid #e2e8f0;
        background-color: white;
        color: #6b7280;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 150ms ease;
      }

      .rating-btn:hover {
        border-color: #2563eb;
        color: #2563eb;
        transform: translateY(-1px);
      }

      .rating-btn.selected {
        background-color: #2563eb;
        border-color: #2563eb;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .rating-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #6b7280;
        font-style: italic;
      }

      .survey-footer {
        padding: 1.5rem 2rem;
        border-top: 1px solid #e2e8f0;
        background-color: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .footer-info {
        flex: 1;
      }

      .completion-status {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .footer-actions {
        display: flex;
        gap: 1rem;
      }

      .cancel-btn {
        background-color: transparent;
        color: #6b7280;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
      }

      .cancel-btn:hover {
        background-color: #f9fafb;
        border-color: #9ca3af;
      }

      .submit-btn {
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 150ms ease;
      }

      .submit-btn:hover:not(.disabled) {
        background-color: #1d4ed8;
      }

      .submit-btn.disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
      }

      .thank-you-content {
        padding: 3rem 2rem;
        text-align: center;
      }

      .thank-you-icon {
        margin-bottom: 1.5rem;
        color: #10b981;
      }

      .thank-you-content h2 {
        margin: 0 0 1rem 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
      }

      .thank-you-content p {
        margin: 0 0 2rem 0;
        color: #6b7280;
        font-size: 1.125rem;
      }

      .survey-summary {
        background-color: #f0f9ff;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        justify-content: center;
        gap: 2rem;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .summary-label {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .summary-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #0f172a;
      }

      .close-thank-you-btn {
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 150ms ease;
      }

      .close-thank-you-btn:hover {
        background-color: #1d4ed8;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* Mobile responsiveness */
      @media (max-width: 640px) {
        .modal-container {
          margin: 0.5rem;
          max-width: none;
        }

        .survey-header {
          padding: 1rem 1.5rem;
        }

        .survey-header h2 {
          font-size: 1.25rem;
        }

        .survey-progress {
          padding: 0.75rem 1.5rem;
        }

        .survey-body {
          padding: 1.5rem;
        }

        .rating-container {
          margin-left: 0;
        }

        .question-header {
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-scale {
          justify-content: center;
        }

        .rating-btn {
          width: 36px;
          height: 36px;
        }

        .survey-footer {
          padding: 1rem 1.5rem;
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .footer-actions {
          justify-content: stretch;
        }

        .footer-actions button {
          flex: 1;
        }

        .survey-summary {
          flex-direction: column;
          gap: 1rem;
        }
      }

      /* Animation disabled */
      :host-context(.no-animations) * {
        transition: none !important;
        animation: none !important;
      }
    `,
  ],
})
export class SurveyModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false
  @Output() close = new EventEmitter<void>()

  surveyStarted = false
  showThankYou = false

  questions: SurveyQuestion[] = [
    {
      id: 1,
      text: "¿Crees que permitir a los capitanes ver información detallada del puerto en el que se encuentran (nombre, país, estado) ayudaría a tomar mejores decisiones?",
      rating: 0,
    },
    {
      id: 2,
      text: "¿Consideras que guardar automáticamente el último viaje realizado facilitaría la evaluación y trazabilidad de las operaciones?",
      rating: 0,
    },
    {
      id: 3,
      text: "¿Piensas que un mapa esquemático visual de los puertos disponibles ayudaría a los usuarios a comprender mejor sus trayectos?",
      rating: 0,
    },
    {
      id: 4,
      text: "¿Crees que ofrecer un reporte final que incluya la ruta tomada, eventos y tiempos de recorrido mejoraría la capacidad de análisis post-viaje?",
      rating: 0,
    },
    {
      id: 5,
      text: "¿Consideras que disponer de un reporte de navegación sencillo ayudaría a los operadores logísticos a monitorear el estado y desempeño de sus rutas?",
      rating: 0,
    },
    {
      id: 6,
      text: "¿Piensas que recalcular automáticamente la ruta en caso de cierre de un puerto durante la navegación puede mejorar la confiabilidad del sistema?",
      rating: 0,
    },
    {
      id: 7,
      text: "¿Crees que mostrar automáticamente la ruta más corta entre dos puertos en la plataforma ayudaría a optimizar la logística?",
      rating: 0,
    },
    {
      id: 8,
      text: "¿Consideras que incorporar una lista visible de puertos con su estado operativo en la plataforma mejoraría la toma de decisiones de los usuarios?",
      rating: 0,
    },
  ]

  constructor(private googleAnalytics: GoogleAnalyticsService) {}

  ngOnInit(): void {

    if (this.isOpen) {
      this.googleAnalytics.trackEvent("survey_modal_open", "User Feedback", "Survey Modal Opened")
    }
  }

  ngOnDestroy(): void {

    if (this.surveyStarted && !this.showThankYou) {
      const completedQuestions = this.getCompletedQuestions()
      if (completedQuestions > 0) {
        this.googleAnalytics.trackSurveyAbandon(completedQuestions, this.questions.length)
      }
    }
  }

  startSurvey(): void {
    this.surveyStarted = true
    this.googleAnalytics.trackSurveyStart()
  }

  setRating(questionId: number, rating: number): void {
    const question = this.questions.find((q) => q.id === questionId)
    if (question) {
      const previousRating = question.rating
      question.rating = rating


      const response: SurveyResponse = {
        questionNumber: questionId,
        questionText: question.text,
        rating: rating,
      }

      this.googleAnalytics.trackSurveyResponse(response)
    }
  }

  getRatingLabel(rating: number): string {
    if (rating <= 2) return "Muy en desacuerdo"
    if (rating <= 4) return "En desacuerdo"
    if (rating <= 6) return "Neutral"
    if (rating <= 8) return "De acuerdo"
    return "Muy de acuerdo"
  }

  getCompletedQuestions(): number {
    return this.questions.filter((q) => q.rating > 0).length
  }

  getProgressPercentage(): number {
    return (this.getCompletedQuestions() / this.questions.length) * 100
  }

  isAllQuestionsAnswered(): boolean {
    return this.questions.every((q) => q.rating > 0)
  }

  getAverageRating(): number {
    const totalRating = this.questions.reduce((sum, q) => sum + q.rating, 0)
    return totalRating / this.questions.length
  }

  submitSurvey(): void {
    if (!this.isAllQuestionsAnswered()) {
      return
    }


    const responses: SurveyResponse[] = this.questions.map((q) => ({
      questionNumber: q.id,
      questionText: q.text,
      rating: q.rating,
    }))

    const averageRating = this.getAverageRating()


    this.googleAnalytics.trackSurveyComplete(responses, averageRating)


    localStorage.setItem("survey_completed", new Date().toISOString())
    localStorage.setItem("survey_average_rating", averageRating.toString())


    this.showThankYou = true
  }

  onOverlayClick(event: Event): void {

    this.closeSurvey()
  }

  closeSurvey(): void {

    if (this.surveyStarted && !this.showThankYou) {
      const completedQuestions = this.getCompletedQuestions()
      if (completedQuestions === 0) {
        this.googleAnalytics.trackSurveyDismiss()
      } else {
        this.googleAnalytics.trackSurveyAbandon(completedQuestions, this.questions.length)
      }
    }

    this.close.emit()
  }
}
