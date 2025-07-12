import { Component, OnInit, ViewChild, type ElementRef, type AfterViewInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import {  Router, type ActivatedRoute, RouterModule } from "@angular/router"
import  { AuthService } from "../../../services/auth.service"
import  { RecaptchaService } from "../../../services/recaptcha.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
              <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2v5z"></path>
              <path d="M6 7V5c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span class="logo-text">Maritime Route</span>
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Ingrese sus credenciales para acceder al sistema</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <div class="input-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                id="username"
                formControlName="username"
                placeholder="Ingrese su nombre de usuario"
                [ngClass]="{'is-invalid': submitted && f['username'].errors}"
              >
            </div>
            <div *ngIf="submitted && f['username'].errors" class="error-message">
              <span *ngIf="f['username'].errors['required']">El nombre de usuario es requerido</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Ingrese su contraseña"
                [ngClass]="{'is-invalid': submitted && f['password'].errors}"
              >
              <button
                type="button"
                class="password-toggle"
                (click)="togglePasswordVisibility()"
                tabindex="-1"
              >
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <div *ngIf="submitted && f['password'].errors" class="error-message">
              <span *ngIf="f['password'].errors['required']">La contraseña es requerida</span>
            </div>
          </div>

          <!-- reCAPTCHA Section -->
          <div class="form-group">
            <label>Verificación de Seguridad</label>
            <div class="recaptcha-container">
              <div #recaptchaElement id="recaptcha-element" class="recaptcha-widget"></div>
              <div *ngIf="recaptchaError" class="error-message">
                <span>Por favor, complete la verificación reCAPTCHA</span>
              </div>
            </div>
          </div>

          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="remember" formControlName="remember">
              <label for="remember">Recordarme</label>
            </div>
            <a href="#" class="forgot-password">¿Olvidó su contraseña?</a>
          </div>

          <div *ngIf="error" class="alert-error">
            {{ error }}
          </div>

          <div *ngIf="registeredMessage" class="alert-success">
            {{ registeredMessage }}
          </div>

          <button type="submit" class="login-btn" [disabled]="loading">
            <span *ngIf="!loading">Iniciar Sesión</span>
            <div *ngIf="loading" class="spinner"></div>
          </button>
        </form>

        <div class="login-footer">
          <p>¿No tiene una cuenta? <a [routerLink]="['/register']">Registrarse</a></p>
          <div class="test-credentials">
            <div class="credential-item">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div class="credential-item">
              <strong>Capitán:</strong> captain / captain123
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f8fafc;
        padding: 1rem;
      }

      .login-card {
        width: 100%;
        max-width: 450px;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .login-header {
        padding: 2rem 2rem 1rem;
        text-align: center;
      }

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .logo-icon {
        color: #0a6cbc;
      }

      .logo-text {
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        color: #0f172a;
        margin-left: 0.5rem;
      }

      .login-header h1 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        color: #0f172a;
      }

      .login-header p {
        margin: 0;
        color: #64748b;
        font-size: 0.875rem;
      }

      .login-form {
        padding: 1.5rem 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #0f172a;
      }

      .input-container {
        position: relative;
      }

      .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
      }

      input[type="text"],
      input[type="password"] {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: all 150ms ease;

        &:focus {
          outline: none;
          border-color: #0a6cbc;
          box-shadow: 0 0 0 2px rgba(10, 108, 188, 0.1);
        }

        &.is-invalid {
          border-color: #ef4444;
        }
      }

      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0;

        &:hover {
          color: #0f172a;
        }
      }

      /* reCAPTCHA Styles */
      .recaptcha-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .recaptcha-widget {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      /* Responsive reCAPTCHA */
      @media (max-width: 480px) {
        .recaptcha-widget {
          transform: scale(0.85);
          transform-origin: center;
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
      }

      .remember-me {
        display: flex;
        align-items: center;

        input[type="checkbox"] {
          margin-right: 0.5rem;
        }

        label {
          margin-bottom: 0;
          color: #64748b;
        }
      }

      .forgot-password {
        color: #0a6cbc;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .alert-error {
        padding: 0.75rem 1rem;
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
      }

      .alert-success {
        padding: 0.75rem 1rem;
        background-color: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border-radius: 0.375rem;
        margin-bottom: 1.5rem;
        font-size: 0.875rem;
      }

      .login-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 150ms ease;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 2.75rem;
        background-color: #0a6cbc;
        color: white;

        &:hover {
          background-color: #084e88;
        }

        &:disabled {
          background-color: #6b9ecf;
          cursor: not-allowed;
        }
      }

      .spinner {
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-message {
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .login-footer {
        padding: 1.5rem 2rem;
        border-top: 1px solid #e2e8f0;
        background-color: #f8fafc;
        text-align: center;

        p {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        a {
          color: #0a6cbc;
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .test-credentials {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .credential-item {
        font-size: 0.75rem;
        color: #475569;

        strong {
          color: #0f172a;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("recaptchaElement", { static: false }) recaptchaElement!: ElementRef

  loginForm!: FormGroup
  loading = false
  submitted = false
  error = ""
  showPassword = false
  returnUrl = "/"
  registeredMessage = ""
  recaptchaError = false
  recaptchaWidgetId: number | null = null

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private recaptchaService: RecaptchaService,
  ) {
    // Verificar si se está forzando la página de login
    const forceLogin = this.route.snapshot.queryParams["forceLogin"] === "true"

    // Redirigir al dashboard si ya está autenticado y no se está forzando el login
    if (this.authService.isLoggedIn && !forceLogin) {
      this.router.navigate(["/dashboard"])
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
      remember: [false],
    })

    // Obtener la URL de retorno de los parámetros de consulta o usar el valor predeterminado
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/dashboard"

    // Verificar si hay un mensaje de error en los parámetros de consulta
    const errorMsg = this.route.snapshot.queryParams["error"]
    if (errorMsg) {
      this.error = errorMsg
    }

    // Verificar si el usuario viene de registrarse
    const registered = this.route.snapshot.queryParams["registered"]
    const username = this.route.snapshot.queryParams["username"]
    if (registered === "true" && username) {
      this.registeredMessage = `Usuario "${username}" registrado con éxito. Por favor, inicie sesión.`

      // Prellenar el campo de usuario
      this.loginForm.patchValue({
        username: username,
      })
    }
  }

  ngAfterViewInit(): void {
    // Inicializar reCAPTCHA después de que la vista se haya inicializado
    setTimeout(() => {
      this.initializeRecaptcha()
    }, 500)
  }

  ngOnDestroy(): void {
    // Limpiar reCAPTCHA si existe
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset(this.recaptchaWidgetId)
    }
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() {
    return this.loginForm.controls
  }

  async initializeRecaptcha(): Promise<void> {
    try {
      this.recaptchaWidgetId = await this.recaptchaService.renderRecaptcha("recaptcha-element")
    } catch (error) {
      console.error("Error initializing reCAPTCHA:", error)
      this.error = "Error al cargar la verificación de seguridad. Por favor, recargue la página."
    }
  }

  onSubmit(): void {
    this.submitted = true
    this.recaptchaError = false

    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return
    }

    // Verificar reCAPTCHA
    const recaptchaResponse = this.recaptchaService.getResponse(this.recaptchaWidgetId || undefined)
    if (!recaptchaResponse) {
      this.recaptchaError = true
      this.error = "Por favor, complete la verificación reCAPTCHA."
      return
    }

    this.loading = true
    this.error = ""

    // Verificar el token de reCAPTCHA
    this.recaptchaService
      .verifyToken(recaptchaResponse)
      .then((isValid) => {
        if (!isValid) {
          this.error = "La verificación reCAPTCHA falló. Por favor, inténtelo de nuevo."
          this.loading = false
          this.recaptchaService.reset(this.recaptchaWidgetId || undefined)
          return
        }

        // Proceder con el login
        this.authService
          .login({
            username: this.f["username"].value,
            password: this.f["password"].value,
          })
          .subscribe({
            next: () => {
              this.router.navigate([this.returnUrl])
            },
            error: (error) => {
              this.error = error.message
              this.loading = false
              // Reset reCAPTCHA en caso de error
              this.recaptchaService.reset(this.recaptchaWidgetId || undefined)
            },
          })
      })
      .catch((error) => {
        this.error = "Error en la verificación de seguridad. Por favor, inténtelo de nuevo."
        this.loading = false
        this.recaptchaService.reset(this.recaptchaWidgetId || undefined)
      })
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }
}
