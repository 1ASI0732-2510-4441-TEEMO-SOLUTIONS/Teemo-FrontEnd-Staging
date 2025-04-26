import { Injectable } from "@angular/core"
import { type Observable, of, throwError } from "rxjs"

interface User {
  id: number
  username: string
  name: string
  email: string
  role: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUser: User | null = null
  private readonly storageKey = "maritime_auth_user"
  private readonly tokenKey = "maritime_auth_token"

  constructor() {
    this.loadUserFromStorage()
  }

  login(username: string, password: string, rememberMe: boolean): Observable<User> {
    // For demo purposes, we'll accept any username/password combination
    // In a real app, this would make an HTTP request to your backend

    // Simulate authentication failure for specific cases
    if (password === "wrongpassword") {
      return throwError(() => new Error("Invalid username or password"))
    }

    // Mock successful login
    const user: User = {
      id: 1,
      username,
      name: "Maritime User",
      email: `${username}@example.com`,
      role: "user",
    }

    // Store user info
    this.currentUser = user

    // Store in localStorage or sessionStorage based on rememberMe
    if (rememberMe) {
      localStorage.setItem(this.storageKey, JSON.stringify(user))
      localStorage.setItem(this.tokenKey, "mock-jwt-token-" + Date.now())
    } else {
      sessionStorage.setItem(this.storageKey, JSON.stringify(user))
      sessionStorage.setItem(this.tokenKey, "mock-jwt-token-" + Date.now())
    }

    return of(user)
  }

  logout(): Observable<boolean> {
    this.currentUser = null
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.tokenKey)
    sessionStorage.removeItem(this.storageKey)
    sessionStorage.removeItem(this.tokenKey)
    return of(true)
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey)
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey)
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser)
      } catch (e) {
        console.error("Error parsing stored user", e)
        this.currentUser = null
      }
    }
  }
}
