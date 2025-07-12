import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class CaptchaService {
  private currentCaptcha = ""

  constructor() {}

  generateCaptcha(): string {
    // Generar un código aleatorio de 5 caracteres
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    this.currentCaptcha = result
    return result
  }

  getCurrentCaptcha(): string {
    return this.currentCaptcha
  }

  validateCaptcha(userInput: string): boolean {
    return userInput.toUpperCase() === this.currentCaptcha.toUpperCase()
  }

  generateCaptchaImage(captchaText: string, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar el canvas
    canvas.width = 150
    canvas.height = 50

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f0f9ff")
    gradient.addColorStop(1, "#e0f2fe")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Agregar líneas de ruido
    ctx.strokeStyle = "#cbd5e1"
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // Agregar puntos de ruido
    ctx.fillStyle = "#94a3b8"
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Dibujar el texto del captcha
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Dibujar cada carácter con rotación y color aleatorio
    const colors = ["#0a6cbc", "#1e40af", "#059669", "#dc2626", "#7c2d12"]
    for (let i = 0; i < captchaText.length; i++) {
      ctx.save()

      // Posición del carácter
      const x = 30 + i * 20
      const y = 25

      // Rotación aleatoria
      const rotation = (Math.random() - 0.5) * 0.4
      ctx.translate(x, y)
      ctx.rotate(rotation)

      // Color aleatorio
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]

      // Dibujar el carácter
      ctx.fillText(captchaText[i], 0, 0)

      ctx.restore()
    }

    // Agregar más líneas de ruido encima
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }
  }
}
