import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="fw-bold mb-3 text-center">Recuperar contraseña</h2>
      <p class="text-muted text-center mb-4">Ingresa tu correo y te enviaremos un código de 6 dígitos.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label"><i class="bi bi-envelope me-2"></i>Correo</label>
          <input type="email" class="form-control" formControlName="email"
                 placeholder="tu@email.com"
                 [class.is-invalid]="isInvalid('email')">
          <div class="invalid-feedback" *ngIf="isInvalid('email')">
            <small *ngIf="form.get('email')?.errors?.['required']">El correo es requerido</small>
            <small *ngIf="form.get('email')?.errors?.['email']">Ingresa un correo válido</small>
          </div>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>

        <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || isLoading">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Enviar código
        </button>

        <div class="text-center mt-3">
          <a routerLink="/auth/login" class="text-decoration-none">Volver al login</a>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .auth-container{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;
      background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);}
    .auth-card{background:#fff;border-radius:16px;max-width:450px;width:100%;padding:2rem 2.5rem;
      box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 10px 10px -5px rgba(0,0,0,.04)}
    .btn-primary{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none}
  `]
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // (Opcional) precargar email si llega como query param
    const qpEmail = this.route.snapshot.queryParamMap.get('email');
    if (qpEmail) this.form.patchValue({ email: qpEmail });
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true; this.errorMessage = ''; this.successMessage = '';

    const email = this.form.value.email as string;

    this.auth.forgotPasswordOtp(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Si el correo existe, enviamos un código.';
        setTimeout(() =>
          this.router.navigate(['/auth/verify-otp'], { queryParams: { email } }),
          800
        );
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'No se pudo enviar el código.';
      }
    });
  }
}
