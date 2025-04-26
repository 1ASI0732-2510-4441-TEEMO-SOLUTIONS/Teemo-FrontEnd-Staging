import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms" // Regular import for FormBuilder
import {  Router, RouterModule } from "@angular/router" // Regular import for Router
import { AuthService } from "../../../services/auth.service" // Regular import for AuthService

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  isLoading = false
  errorMessage = ""
  showPassword = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    })
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm)
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const { username, password, rememberMe } = this.loginForm.value

    // Simulate API call with timeout
    setTimeout(() => {
      this.authService.login(username, password, rememberMe).subscribe({
        next: () => {
          this.router.navigate(["/dashboard"])
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = error.message || "Invalid username or password"
        },
      })
    }, 1000)
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      }
    })
  }

  // Getters for form controls to simplify template access
  get usernameControl() {
    return this.loginForm.get("username")
  }
  get passwordControl() {
    return this.loginForm.get("password")
  }
}
