import { Injectable } from "@angular/core"
import type { HttpErrorResponse } from "@angular/common/http"

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse): string {
    let errorMessage = "An unknown error occurred"

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = "Could not connect to the server. Please check your internet connection."
      } else if (error.status === 404) {
        errorMessage = "The requested resource was not found."
      } else if (error.status === 403) {
        errorMessage = "You do not have permission to access this resource."
      } else if (error.status === 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message
      } else {
        errorMessage = `Error Code: ${error.status}, Message: ${error.message}`
      }
    }

    return errorMessage
  }
}
