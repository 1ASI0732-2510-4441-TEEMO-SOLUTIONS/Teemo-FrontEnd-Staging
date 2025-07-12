import { Injectable } from "@angular/core"

declare var grecaptcha: any

@Injectable({
  providedIn: "root",
})
export class RecaptchaService {
  private siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test site key - replace with your actual site key
  private isLoaded = false

  constructor() {}

  loadRecaptcha(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isLoaded) {
        resolve()
        return
      }

      if (typeof grecaptcha !== "undefined") {
        this.isLoaded = true
        resolve()
        return
      }

      // Wait for grecaptcha to be available
      const checkRecaptcha = () => {
        if (typeof grecaptcha !== "undefined") {
          this.isLoaded = true
          resolve()
        } else {
          setTimeout(checkRecaptcha, 100)
        }
      }

      checkRecaptcha()
    })
  }

  renderRecaptcha(elementId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.loadRecaptcha()
        .then(() => {
          try {
            const widgetId = grecaptcha.render(elementId, {
              sitekey: this.siteKey,
              callback: (response: string) => {
                // Response will be handled by the component
              },
              "expired-callback": () => {
                // Handle expiration
              },
              "error-callback": () => {
                // Handle error
              },
            })
            resolve(widgetId)
          } catch (error) {
            reject(error)
          }
        })
        .catch(reject)
    })
  }

  getResponse(widgetId?: number): string {
    if (typeof grecaptcha !== "undefined") {
      return grecaptcha.getResponse(widgetId)
    }
    return ""
  }

  reset(widgetId?: number): void {
    if (typeof grecaptcha !== "undefined") {
      grecaptcha.reset(widgetId)
    }
  }

  getSiteKey(): string {
    return this.siteKey
  }

  // Verify reCAPTCHA token on the server side (this would typically be done on your backend)
  verifyToken(token: string): Promise<boolean> {
    // This is a mock implementation
    // In a real application, you would send the token to your backend
    // and verify it with Google's API
    return new Promise((resolve) => {
      if (token && token.length > 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }
}
