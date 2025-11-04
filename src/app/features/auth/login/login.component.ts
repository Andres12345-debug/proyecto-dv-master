import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { RouterModule, Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card fade-in-up">
        <div class="auth-header text-center mb-4">
          <div class="logo mb-3">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
          <h2 class="fw-bold mb-2">Bienvenido de vuelta</h2>
          <p class="text-muted">Inicia sesión para continuar tu descubrimiento vocacional</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">
              <i class="bi bi-envelope me-2"></i>Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              class="form-control"
              formControlName="email"
              [class.is-invalid]="isFieldInvalid('email')"
              placeholder="tu@email.com"
            >
            <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
              <small *ngIf="loginForm.get('email')?.errors?.['required']">
                El correo electrónico es requerido
              </small>
              <small *ngIf="loginForm.get('email')?.errors?.['email']">
                Ingresa un correo electrónico válido
              </small>
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">
              <i class="bi bi-lock me-2"></i>Contraseña
            </label>
            <div class="input-group">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="isFieldInvalid('password')"
                placeholder="Tu contraseña"
              >
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="togglePassword()"
              >
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
              <small *ngIf="loginForm.get('password')?.errors?.['required']">
                La contraseña es requerida
              </small>
            </div>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rememberMe">
              <label class="form-check-label" for="rememberMe">
                Recordarme
              </label>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="errorMessage">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-box-arrow-in-right me-2" *ngIf="!isLoading"></i>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

          
            <div class="text-end mb-3">
           <a routerLink="/auth/forgot" class="text-decoration-none">¿Olvidaste tu contraseña?</a>
        </div>
          <div class="text-center">
            <p class="mb-0">
              ¿No tienes cuenta?
              <a routerLink="/auth/register" class="text-decoration-none fw-semibold">
                Regístrate aquí
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
    .auth-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .logo i {
      font-size: 2.5rem;
      color: white;
    }

    .form-label {
      font-weight: 600;
      color: #374151;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    @media (max-width: 576px) {
      .auth-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }
    }
  `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  showPassword = false
  errorMessage = ""
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
  if (this.loginForm.invalid || this.isLoading) return; // ⬅️ evita doble post

  this.isLoading = true;
  this.errorMessage = "";

  this.authService.login(this.loginForm.value).subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response.success) {
        this.authService.setSession(response.token, response.user); // asegúrate de guardar sesión
        this.router.navigate(["/dashboard"]);
      }
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error?.error?.message || "Error al iniciar sesión. Intenta nuevamente.";
    },
  });
}


  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key)
      control?.markAsTouched()
    })
  }
}
