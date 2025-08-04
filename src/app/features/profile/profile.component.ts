import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../core/services/auth.service"
import { UserService } from "../../core/services/user.service"
import { TestService } from "../../core/services/test.service"
import { LoadingService } from "../../core/services/loading.service"
import { User } from "../../core/models/user.model"
import { TestResult } from "../../core/models/test.model"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="row">
        <!-- Profile Form -->
        <div class="col-lg-8">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="material-icons me-2"></i>
                Mi Perfil
              </h4>
            </div>
            <div class="card-body">
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">
                      <i class="material-icons me-1"></i>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      class="form-control"
                      formControlName="name"
                      [class.is-invalid]="isFieldInvalid('name')"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                      El nombre es requerido
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">
                      <i class="material-icons me-1">Correo Electrónico</i>

                    </label>
                    <input
                      type="email"
                      id="email"
                      class="form-control"
                      formControlName="email"
                      readonly
                      style="background-color: #f8f9fa;"
                    >
                    <small class="text-muted">El email no se puede modificar</small>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="age" class="form-label">
                      <i class="material-icons me-1">Edad</i>

                    </label>
                    <input
                      type="number"
                      id="age"
                      class="form-control"
                      formControlName="age"
                      min="15"
                      max="100"
                      [class.is-invalid]="isFieldInvalid('age')"
                    >
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('age')">
                      <small *ngIf="profileForm.get('age')?.errors?.['min']">
                        La edad mínima es 15 años
                      </small>
                      <small *ngIf="profileForm.get('age')?.errors?.['max']">
                        La edad máxima es 100 años
                      </small>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="location" class="form-label">
                      <i class="material-icons me-1">Ubicación</i>

                    </label>
                    <input
                      type="text"
                      id="location"
                      class="form-control"
                      formControlName="location"
                      placeholder="Ciudad, País"
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label for="education_level" class="form-label">
                    <i class="material-icons me-1">Nivel Educativo</i>

                  </label>
                  <select id="education_level" class="form-select" formControlName="education_level">
                    <option value="">Selecciona tu nivel educativo</option>
                    <option value="Secundario Incompleto">Secundario Incompleto</option>
                    <option value="Secundario Completo">Secundario Completo</option>
                    <option value="Universitario Incompleto">Universitario Incompleto</option>
                    <option value="Universitario Completo">Universitario Completo</option>
                    <option value="Posgrado">Posgrado</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label for="interests" class="form-label">
                    <i class="material-icons me-1">Intereses</i>

                  </label>
                  <textarea
                    id="interests"
                    class="form-control"
                    formControlName="interests"
                    rows="4"
                    placeholder="Describe tus intereses principales..."
                  ></textarea>
                </div>

                <div class="alert alert-success" *ngIf="successMessage">
                  <i class="material-icons me-2">check_circle</i>
                  {{ successMessage }}
                </div>

                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="material-icons me-2">error</i>
                  {{ errorMessage }}
                </div>

                <div class="d-flex gap-3">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="profileForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="material-icons me-2" *ngIf="!isLoading"></i>
                    {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" (click)="resetForm()">
                    <i class="material-icons me-2">Restablecer</i>

                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Profile Stats -->
        <div class="col-lg-4">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2">Estadísticas del Perfil</i>

              </h5>
            </div>
            <div class="card-body">
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span>Perfil Completo</span>
                  <div class="d-flex align-items-center">
                    <div class="progress me-2" style="width: 100px; height: 8px;">
                      <div
                        class="progress-bar bg-success"
                        role="progressbar"
                        [style.width.%]="getProfileCompletion()"
                        [attr.aria-valuenow]="getProfileCompletion()"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <strong>{{ getProfileCompletion() }}%</strong>
                  </div>
                </div>
              </div>

              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Tests Realizados</span>
                  <strong>{{ testHistory.length }}</strong>
                </div>
              </div>

              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Miembro desde</span>
                  <strong>{{ formatDate(currentUser?.created_at) }}</strong>
                </div>
              </div>

              <div class="stat-item">
                <div class="d-flex justify-content-between">
                  <span>Último acceso</span>
                  <strong>{{ formatDate(currentUser?.last_login) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2">Acciones Rápidas</i>

              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <a routerLink="/test" class="btn btn-primary">
                  <i class="material-icons me-2">Realizar Test Vocacional</i>

                </a>
                <a routerLink="/universities" class="btn btn-outline-secondary">
                  <i class="material-icons me-2">Explorar Universidades</i>

                </a>
                <button class="btn btn-outline-info" (click)="downloadProfile()">
                  <i class="material-icons me-2">Descargar Perfil</i>

                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Test History -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <i class="material-icons me-2">Historial de Tests</i>

              </h4>
              <span class="badge bg-primary">{{ testHistory.length }} tests</span>
            </div>
            <div class="card-body">
              <div *ngIf="testHistory.length === 0" class="text-center py-4">
                <i class="material-icons text-muted mb-3" style="font-size: 64px;"><i class="bi bi-emoji-frown-fill"></i></i>
                <h5>No has realizado ningún test aún</h5>
                <p class="text-muted mb-4">
                  Realiza tu primer test vocacional para recibir recomendaciones personalizadas
                </p>
                <a routerLink="/test" class="btn btn-primary">
                  <i class="material-icons me-2"></i>
                  Realizar Primer Test
                </a>
              </div>

              <div *ngIf="testHistory.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Aptitudes Principales</th>
                      <th>Recomendaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let test of testHistory">
                      <td>
                        <strong>{{ formatDate(test.completed_at) }}</strong><br>
                        <small class="text-muted">{{ formatTime(test.completed_at || '') }}</small>
                      </td>
                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          <span *ngFor="let aptitude of test.aptitudes?.slice(0, 3)" class="badge bg-light text-dark">
                            {{ aptitude.name }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-success">
                          {{ test.recommendations.length || 0 }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <a
                            [routerLink]="['/test/results', test.id]"
                            class="btn btn-outline-primary"
                            title="Ver resultados"
                          >
                            <i class="material-icons">ver</i>
                          </a>
                          <button
                            class="btn btn-outline-secondary"
                            (click)="shareTest(test)"
                            title="Compartir"
                          >
                            <i class="material-icons">enviar</i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .stat-item {
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .progress {
      background-color: #e9ecef;
      border-radius: 10px;
    }

    .progress-bar {
      border-radius: 10px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }

    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    .badge.bg-light {
      border: 1px solid #dee2e6;
    }

    .btn-group-sm .btn {
      padding: 4px 8px;
    }

    .btn-group-sm .btn i {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .table-responsive {
        font-size: 14px;
      }

      .btn-group {
        flex-direction: column;
      }

      .d-flex.gap-3 {
        flex-direction: column;
      }
    }
  `,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup
  currentUser: User | null = null
  testHistory: TestResult[] = []
  isLoading = false
  successMessage = ""
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private testService: TestService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadUserData()
    this.loadTestHistory()
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required]],
      email: [""],
      age: ["", [Validators.min(15), Validators.max(100)]],
      location: [""],
      education_level: [""],
      interests: [""],
    })
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          age: user.age,
          location: user.location,
          education_level: user.education_level,
          interests: user.interests,
        })
      }
    })
  }

  private loadTestHistory(): void {
    const user = this.authService.getCurrentUser()
    if (user) {
      this.testService.getUserTestHistory(user.id).subscribe({
        next: (history) => {
          console.log("HISTORIAL RECIBIDO:", history)
          this.testHistory = history
        },
        error: (error) => {
          console.error("Error loading test history:", error)
        },
      })
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true
      this.successMessage = ""
      this.errorMessage = ""

      const formData = { ...this.profileForm.value }
      delete formData.email // No enviar email

      // CORRECCIÓN: usar el método correcto del servicio
      this.userService.updateProfile(this.currentUser.id, formData).subscribe({
        next: (response) => {
          this.isLoading = false
          this.successMessage = "Perfil actualizado exitosamente"

          // Actualizar usuario en el servicio de auth
          const updatedUser = { ...this.currentUser!, ...response.user }
          this.authService.updateCurrentUser(updatedUser)

          setTimeout(() => {
            this.successMessage = ""
          }, 3000)
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = error.error?.error || "Error actualizando el perfil"
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  resetForm(): void {
    this.loadUserData()
    this.successMessage = ""
    this.errorMessage = ""
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key)
      control?.markAsTouched()
    })
  }

  getProfileCompletion(): number {
    if (!this.currentUser) return 0

    const fields = ["name", "email", "age", "location", "education_level", "interests"]
    const completedFields = fields.filter((field) => {
      const value = this.currentUser![field as keyof User]
      return value !== null && value !== undefined && value !== ""
    })

    return Math.round((completedFields.length / fields.length) * 100)
  }

  formatDate(dateString?: string): string {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  shareTest(test: TestResult): void {
    let aptitudes = Array.isArray(test.aptitudes)
      ? test.aptitudes.filter((a: any) => a && a.id !== null && a.name)
      : []

    if (navigator.share) {
      navigator.share({
        title: "Mis Resultados del Test Vocacional",
        text: `He completado un test vocacional. Mis aptitudes principales son: ${aptitudes
          .slice(0, 3)
          .map((a: { name: string }) => a.name)
          .join(", ")}`,
        url: window.location.origin + `/test/results/${test.id}`,
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const url = window.location.origin + `/test/results/${test.id}`
      navigator.clipboard.writeText(url).then(() => {
        alert("Enlace copiado al portapapeles")
      })
    }
  }

  downloadProfile(): void {
    const profileData = {
      usuario: this.currentUser,
      historial_tests: this.testHistory,
      fecha_descarga: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(profileData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    // Corrección: nombre de archivo seguro y sin caracteres especiales
    const safeName =
      (this.currentUser?.name?.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "usuario")
    link.download = `perfil_vocacional_${safeName}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }
}
