import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="fw-bold mb-3 text-center">Nueva contraseña</h2>
      <p class="text-muted text-center mb-4">Crea una contraseña segura para tu cuenta.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label"><i class="bi bi-lock me-2"></i>Nueva contraseña</label>
          <input [type]="show ? 'text':'password'" class="form-control" formControlName="password"
                 placeholder="Mínimo 6 caracteres" [class.is-invalid]="isInvalid('password')">
          <div class="invalid-feedback" *ngIf="isInvalid('password')">Debe tener al menos 6 caracteres</div>
        </div>

        <div class="mb-3">
          <label class="form-label"><i class="bi bi-lock-fill me-2"></i>Confirmar contraseña</label>
          <input [type]="show ? 'text':'password'" class="form-control" formControlName="confirm"
                 placeholder="Repite la contraseña" [class.is-invalid]="isInvalid('confirm') || mismatch">
          <div class="invalid-feedback" *ngIf="isInvalid('confirm')">Campo requerido</div>
          <div class="invalid-feedback" *ngIf="mismatch">Las contraseñas no coinciden</div>
        </div>

        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="showPass" (change)="show=!show">
          <label class="form-check-label" for="showPass">Mostrar contraseña</label>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>

        <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || mismatch || isLoading">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Cambiar contraseña
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
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;   // <-- se inicializa en ngOnInit
  show = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    });
  }

  get mismatch() {
    const { password, confirm } = this.form.value;
    return !!password && !!confirm && password !== confirm;
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit() {
    if (this.form.invalid || this.mismatch) return;
    const resetToken = sessionStorage.getItem('reset_token');
    if (!resetToken) {
      this.errorMessage = 'El token de reseteo no está disponible. Repite el proceso.';
      return;
    }

    this.isLoading = true; this.errorMessage = ''; this.successMessage = '';
    const newPassword = this.form.value.password as string;

    this.auth.resetPasswordWithOtp(newPassword, resetToken).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Contraseña actualizada. Redirigiendo al login...';
        sessionStorage.removeItem('reset_token');
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'No se pudo actualizar la contraseña.';
      }
    });
  }
}
