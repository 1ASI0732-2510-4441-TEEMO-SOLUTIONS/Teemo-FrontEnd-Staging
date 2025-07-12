import { Injectable } from "@angular/core"

declare let gtag: Function

export interface SurveyResponse {
  questionNumber: number
  questionText: string
  rating: number
}

@Injectable({
  providedIn: "root",
})
export class GoogleAnalyticsService {
  constructor() {

    if (typeof gtag === "undefined") {
      console.warn("Google Analytics gtag not found. Make sure GA is properly loaded.")
    }
  }


  trackSurveyStart(): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "survey_start", {
        event_category: "User Feedback",
        event_label: "Platform Improvement Survey",
        value: 1,
      })
    }
  }


  trackSurveyResponse(response: SurveyResponse): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "survey_response", {
        event_category: "User Feedback",
        event_label: `Question ${response.questionNumber}: ${response.questionText.substring(0, 50)}...`,
        value: response.rating,
        custom_parameters: {
          question_number: response.questionNumber,
          rating: response.rating,
          question_text: response.questionText,
        },
      })
    }
  }


  trackSurveyComplete(responses: SurveyResponse[], averageRating: number): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "survey_complete", {
        event_category: "User Feedback",
        event_label: "Platform Improvement Survey Completed",
        value: Math.round(averageRating),
        custom_parameters: {
          total_questions: responses.length,
          average_rating: averageRating,
          completion_date: new Date().toISOString(),
          responses: JSON.stringify(
            responses.map((r) => ({
              q: r.questionNumber,
              r: r.rating,
            })),
          ),
        },
      })
    }
  }

  trackSurveyAbandon(completedQuestions: number, totalQuestions: number): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "survey_abandon", {
        event_category: "User Feedback",
        event_label: "Survey Abandoned",
        value: completedQuestions,
        custom_parameters: {
          completed_questions: completedQuestions,
          total_questions: totalQuestions,
          completion_percentage: Math.round((completedQuestions / totalQuestions) * 100),
        },
      })
    }
  }


  trackSurveyDismiss(): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "survey_dismiss", {
        event_category: "User Feedback",
        event_label: "Survey Notification Dismissed",
        value: 1,
      })
    }
  }


  trackEvent(action: string, category: string, label?: string, value?: number): void {
    if (typeof gtag !== "undefined") {
      gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }


  trackPageView(pageName: string, pageTitle?: string): void {
    if (typeof gtag !== "undefined") {
      gtag("config", "GA_MEASUREMENT_ID", {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
      })
    }
  }
}
