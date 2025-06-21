import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface ThemeConfig {
  mode: "light" | "dark" | "auto"
  primaryColor: string
  accentColor: string
  fontSize: "small" | "medium" | "large"
  animations: boolean
  compactMode: boolean
}

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly THEME_KEY = "maritime_theme_config"
  private readonly defaultConfig: ThemeConfig = {
    mode: "light",
    primaryColor: "#0a6cbc",
    accentColor: "#ff6e40",
    fontSize: "medium",
    animations: true,
    compactMode: false,
  }

  private themeConfigSubject = new BehaviorSubject<ThemeConfig>(this.loadThemeConfig())
  public themeConfig$ = this.themeConfigSubject.asObservable()

  private isDarkModeSubject = new BehaviorSubject<boolean>(this.getCurrentMode() === "dark")
  public isDarkMode$ = this.isDarkModeSubject.asObservable()

  constructor() {
    this.initializeTheme()
    this.setupAutoModeListener()
  }

  private loadThemeConfig(): ThemeConfig {
    const saved = localStorage.getItem(this.THEME_KEY)
    if (saved) {
      try {
        return { ...this.defaultConfig, ...JSON.parse(saved) }
      } catch {
        return this.defaultConfig
      }
    }
    return this.defaultConfig
  }

  private saveThemeConfig(config: ThemeConfig): void {
    localStorage.setItem(this.THEME_KEY, JSON.stringify(config))
    this.themeConfigSubject.next(config)
  }

  private getCurrentMode(): "light" | "dark" {
    const config = this.themeConfigSubject.value
    if (config.mode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return config.mode
  }

  private initializeTheme(): void {
    const config = this.themeConfigSubject.value
    this.applyTheme(config)
  }

  private setupAutoModeListener(): void {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", () => {
      if (this.themeConfigSubject.value.mode === "auto") {
        this.updateDarkMode()
      }
    })
  }

  private applyTheme(config: ThemeConfig): void {
    const root = document.documentElement

    // Apply theme mode
    this.updateDarkMode()

    // Apply custom colors
    root.style.setProperty("--primary-color", config.primaryColor)
    root.style.setProperty("--accent-color", config.accentColor)

    // Apply font size
    const fontSizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }
    root.style.setProperty("--base-font-size", fontSizes[config.fontSize])

    // Apply animations
    root.style.setProperty("--animation-duration", config.animations ? "0.3s" : "0s")

    // Apply compact mode
    root.classList.toggle("compact-mode", config.compactMode)
  }

  private updateDarkMode(): void {
    const isDark = this.getCurrentMode() === "dark"
    document.documentElement.classList.toggle("dark-mode", isDark)
    this.isDarkModeSubject.next(isDark)
  }

  // Public methods
  toggleDarkMode(): void {
    const config = this.themeConfigSubject.value
    const newMode = config.mode === "dark" ? "light" : "dark"
    this.updateThemeConfig({ mode: newMode })
  }

  setThemeMode(mode: "light" | "dark" | "auto"): void {
    this.updateThemeConfig({ mode })
  }

  updateThemeConfig(updates: Partial<ThemeConfig>): void {
    const currentConfig = this.themeConfigSubject.value
    const newConfig = { ...currentConfig, ...updates }
    this.saveThemeConfig(newConfig)
    this.applyTheme(newConfig)
  }

  getCurrentThemeConfig(): ThemeConfig {
    return this.themeConfigSubject.value
  }

  resetToDefaults(): void {
    this.saveThemeConfig(this.defaultConfig)
    this.applyTheme(this.defaultConfig)
  }
}
