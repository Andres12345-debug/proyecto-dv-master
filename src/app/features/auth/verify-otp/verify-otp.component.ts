import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="fw-bold mb-3 text-center">Verificar código</h2>
      <p class="text-muted text-center mb-4">Revisa tu correo y escribe el código de 6 dígitos.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="form-label">Correo</label>
          <input type="email" class="form-control" formControlName="email" readonly>
        </div>

        <div class="mb-3">
          <label class="form-label"><i class="bi bi-shield-lock me-2"></i>Código</label>
          <input type="text" maxlength="6" class="form-control text-center"
                 formControlName="code" placeholder="000000"
                 (input)="allowDigitsOnly($event)"
                 [class.is-invalid]="isInvalid('code')">
          <div class="invalid-feedback" *ngIf="isInvalid('code')">
            Ingresa el código de 6 dígitos
          </div>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

        <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || isLoading">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Verificar
        </button>

        <div class="text-center mt-3">
          <a [routerLink]="['/auth/forgot']" [queryParams]="{ email: form.getRawValue().email }"
             class="text-decoration-none">¿No te llegó? Reenviar</a>
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
export class VerifyOtpComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // inicializa el form aquí (o en el constructor)
    this.form = this.fb.group({
      // puedes dejarlo deshabilitado si no quieres que lo editen:
      // email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });

    // precarga email desde query params
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    this.form.patchValue({ email });
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  allowDigitsOnly(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    this.form.get('code')?.setValue(input.value, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true; this.errorMessage = '';

    // si en algún momento deshabilitas el email, usa getRawValue()
    const { email, code } = this.form.getRawValue();

    this.auth.verifyOtp(email, code).subscribe({
      next: (res) => {
        this.isLoading = false;
        const token = res?.reset_token;
        if (token) {
          sessionStorage.setItem('reset_token', token);
          this.router.navigate(['/auth/reset-password']);
        } else {
          this.errorMessage = 'Respuesta inválida del servidor.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Código inválido o expirado.';
      }
    });
  }
}
