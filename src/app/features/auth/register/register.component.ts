import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { RouterModule, Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card fade-in-up">
        <div class="auth-header text-center mb-4">
          <div class="logo mb-3">
            <i class="bi bi-person-plus-fill"></i>
          </div>
          <h2 class="fw-bold mb-2">Crear Cuenta</h2>
          <p class="text-muted">Únete a nosotros y descubre tu futuro profesional</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">
                <i class="bi bi-person me-2"></i>Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                class="form-control"
                formControlName="name"
                [class.is-invalid]="isFieldInvalid('name')"
                placeholder="Tu nombre completo"
              >
              <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                El nombre es requerido
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="age" class="form-label">
                <i class="bi bi-calendar me-2"></i>Edad
              </label>
              <input
                type="number"
                id="age"
                class="form-control"
                formControlName="age"
                [class.is-invalid]="isFieldInvalid('age')"
                placeholder="Tu edad"
                min="13"
                max="100"
              >
              <div class="invalid-feedback" *ngIf="isFieldInvalid('age')">
                <small *ngIf="registerForm.get('age')?.errors?.['min']">
                  Debes tener al menos 13 años
                </small>
                <small *ngIf="registerForm.get('age')?.errors?.['max']">
                  Edad máxima: 100 años
                </small>
              </div>
            </div>
          </div>

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
              <small *ngIf="registerForm.get('email')?.errors?.['required']">
                El correo electrónico es requerido
              </small>
              <small *ngIf="registerForm.get('email')?.errors?.['email']">
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
                placeholder="Mínimo 6 caracteres"
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
              <small *ngIf="registerForm.get('password')?.errors?.['required']">
                La contraseña es requerida
              </small>
              <small *ngIf="registerForm.get('password')?.errors?.['minlength']">
                La contraseña debe tener al menos 6 caracteres
              </small>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="location" class="form-label">
                <i class="bi bi-geo-alt me-2"></i>Ubicación
              </label>
              <input
                type="text"
                id="location"
                class="form-control"
                formControlName="location"
                placeholder="Ciudad, País"
              >
            </div>

            <div class="col-md-6 mb-3">
              <label for="education_level" class="form-label">
                <i class="bi bi-mortarboard me-2"></i>Nivel Educativo
              </label>
              <select
                id="education_level"
                class="form-select"
                formControlName="education_level"
              >
                <option value="">Selecciona tu nivel</option>
                <option value="secundaria">Secundaria</option>
                <option value="bachillerato">Bachillerato</option>
                <option value="tecnico">Técnico</option>
                <option value="universitario">Universitario</option>
                <option value="posgrado">Posgrado</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label for="interests" class="form-label">
              <i class="bi bi-heart me-2"></i>Intereses (Opcional)
            </label>
            <textarea
              id="interests"
              class="form-control"
              formControlName="interests"
              rows="3"
              placeholder="Describe tus intereses académicos y profesionales..."
            ></textarea>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="acceptTerms" formControlName="acceptTerms">
              <label class="form-check-label" for="acceptTerms">
                Acepto los <a href="#" class="text-decoration-none">términos y condiciones</a>
              </label>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('acceptTerms')">
                Debes aceptar los términos y condiciones
              </div>
            </div>
          </div>

          <div class="alert alert-danger" *ngIf="errorMessage">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>

          <div class="alert alert-success" *ngIf="successMessage">
            <i class="bi bi-check-circle me-2"></i>
            {{ successMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 mb-3"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-person-plus me-2" *ngIf="!isLoading"></i>
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>

          <div class="text-center">
            <p class="mb-0">
              ¿Ya tienes cuenta?
              <a routerLink="/auth/login" class="text-decoration-none fw-semibold">
                Inicia sesión aquí
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
      max-width: 600px;
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup
  showPassword = false
  errorMessage = ""
  successMessage = ""
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      age: ["", [Validators.min(13), Validators.max(100)]],
      location: [""],
      education_level: [""],
      interests: [""],
      acceptTerms: [false, [Validators.requiredTrue]],
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true
      this.errorMessage = ""
      this.successMessage = ""

      const formData = { ...this.registerForm.value }
      delete formData.acceptTerms

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false
          if (response.success) {
            this.successMessage = "Cuenta creada exitosamente. Redirigiendo al login..."
            setTimeout(() => {
              this.router.navigate(["/auth/login"])
            }, 2000)
          }
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = error.error?.message || "Error al crear la cuenta. Intenta nuevamente."
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key)
      control?.markAsTouched()
    })
  }
}
