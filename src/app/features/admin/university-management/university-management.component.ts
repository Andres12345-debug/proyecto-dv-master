import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AdminService } from "../../../core/services/admin.service"
import { UniversityService } from "../../../core/services/university.service"
import { LoadingService } from "../../../core/services/loading.service"
import { University } from "../../../core/models/university.model"

@Component({
  selector: "app-university-management",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="display-6 fw-bold text-primary-custom mb-2">
                <i class="material-icons me-3">school</i>
                Gestión de Universidades
              </h1>
              <p class="lead text-muted">
                Administra universidades y carreras del sistema
              </p>
            </div>
            <div class="admin-actions">
              <button class="btn btn-outline-secondary me-2" (click)="exportUniversities()">
                <i class="material-icons me-2">download</i>
                Exportar
              </button>
              <button class="btn btn-success" (click)="openCreateModal()">
                <i class="material-icons me-2">add</i>
                Nueva Universidad
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4" *ngIf="stats">
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-primary text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">school</i>
              </div>
              <div class="stat-details">
                <h3>{{ stats.total || 0 }}</h3>
                <p class="mb-0">Total Universidades</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-success text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">public</i>
              </div>
              <div class="stat-details">
                <h3>{{ getPublicUniversitiesCount() }}</h3>
                <p class="mb-0">Públicas</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-info text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">business</i>
              </div>
              <div class="stat-details">
                <h3>{{ getPrivateUniversitiesCount() }}</h3>
                <p class="mb-0">Privadas</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-warning text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">public</i>
              </div>
              <div class="stat-details">
                <h3>{{ getCountriesCount() }}</h3>
                <p class="mb-0">Países</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Universities List -->
      <div class="card shadow-sm">
        <div class="card-header">
          <h5 class="mb-0">Lista de Universidades</h5>
        </div>
        <div class="card-body p-0">
          <div *ngIf="!isLoading && universities.length > 0" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Universidad</th>
                  <th>Ubicación</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Rating</th>
                  <th>Carreras</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let university of universities">
                  <td>
                    <div class="university-info">
                      <h6 class="mb-1">{{ university.name }}</h6>
                      <small class="text-muted" *ngIf="university.description">
                        {{ truncateText(university.description, 60) }}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div class="location-info">
                      <i class="material-icons me-1">location_on</i>
                      {{ university.location }}, {{ university.country }}
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="university.type === 'publica' ? 'bg-success' : 'bg-info'"
                    >
                      {{ university.type === 'publica' ? 'Pública' : 'Privada' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-secondary">
                      {{ getModalityLabel(university.modality) }}
                    </span>
                  </td>
                  <td>
                    <div class="rating">
                      <i class="material-icons text-warning me-1">star</i>
                      {{ university.rating }}
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary">
                      {{ university.career_count || 0 }} carreras
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        (click)="viewUniversity(university)"
                        title="Ver detalles"
                      >
                        <i class="material-icons">visibility</i>
                      </button>
                      <button
                        class="btn btn-outline-info"
                        (click)="editUniversity(university)"
                        title="Editar"
                      >
                        <i class="material-icons">edit</i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="deleteUniversity(university)"
                        title="Eliminar"
                      >
                        <i class="material-icons">delete</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && universities.length === 0" class="text-center py-5">
            <i class="material-icons text-muted mb-3" style="font-size: 64px;">school</i>
            <h5>No hay universidades registradas</h5>
            <p class="text-muted">Comienza agregando la primera universidad al sistema</p>
            <button class="btn btn-primary" (click)="openCreateModal()">
              <i class="material-icons me-2">add</i>
              Agregar Universidad
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Cargando universidades...</span>
            </div>
            <h5>Cargando universidades...</h5>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-4">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadUniversities()">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="universityModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="material-icons me-2">school</i>
              {{ isEditMode ? 'Editar Universidad' : 'Nueva Universidad' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="universityForm" (ngSubmit)="saveUniversity()">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="name" class="form-label">Nombre *</label>
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
                  <label for="country" class="form-label">País *</label>
                  <input
                    type="text"
                    id="country"
                    class="form-control"
                    formControlName="country"
                    [class.is-invalid]="isFieldInvalid('country')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('country')">
                    El país es requerido
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="location" class="form-label">Ciudad</label>
                  <input
                    type="text"
                    id="location"
                    class="form-control"
                    formControlName="location"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="website" class="form-label">Sitio Web</label>
                  <input
                    type="url"
                    id="website"
                    class="form-control"
                    formControlName="website"
                    placeholder="https://..."
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="type" class="form-label">Tipo *</label>
                  <select
                    id="type"
                    class="form-select"
                    formControlName="type"
                    [class.is-invalid]="isFieldInvalid('type')"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="publica">Pública</option>
                    <option value="privada">Privada</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('type')">
                    El tipo es requerido
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="modality" class="form-label">Modalidad *</label>
                  <select
                    id="modality"
                    class="form-select"
                    formControlName="modality"
                    [class.is-invalid]="isFieldInvalid('modality')"
                  >
                    <option value="">Seleccionar modalidad</option>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('modality')">
                    La modalidad es requerida
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="rating" class="form-label">Rating</label>
                  <input
                    type="number"
                    id="rating"
                    class="form-control"
                    formControlName="rating"
                    min="0"
                    max="5"
                    step="0.1"
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="contact_email" class="form-label">Email de Contacto</label>
                  <input
                    type="email"
                    id="contact_email"
                    class="form-control"
                    formControlName="contact_email"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="contact_phone" class="form-label">Teléfono</label>
                  <input
                    type="tel"
                    id="contact_phone"
                    class="form-control"
                    formControlName="contact_phone"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">Descripción</label>
                <textarea
                  id="description"
                  class="form-control"
                  formControlName="description"
                  rows="3"
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="admission_requirements" class="form-label">Requisitos de Admisión</label>
                <textarea
                  id="admission_requirements"
                  class="form-control"
                  formControlName="admission_requirements"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="universityForm.invalid || isSaving"
              >
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditMode ? 'Actualizar' : 'Crear' }} Universidad
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .stat-card {
      border-radius: 15px;
      padding: 20px;
      transition: all 0.3s ease;
      height: 100%;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
    }

    .stat-icon {
      font-size: 48px;
      margin-right: 15px;
      opacity: 0.8;
    }

    .stat-icon i {
      font-size: 48px;
    }

    .stat-details h3 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .university-info h6 {
      color: #333;
      font-weight: 600;
    }

    .location-info {
      display: flex;
      align-items: center;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .location-info i {
      font-size: 16px;
    }

    .rating {
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }

    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    .btn-group-sm .btn {
      padding: 4px 8px;
    }

    .btn-group-sm .btn i {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .stat-card {
        margin-bottom: 15px;
      }

      .stat-content {
        flex-direction: column;
        text-align: center;
      }

      .stat-icon {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  `,
  ],
})
export class UniversityManagementComponent implements OnInit {
  universityForm!: FormGroup
  universities: University[] = []
  selectedUniversity: University | null = null
  stats: any = null
  isLoading = false
  isSaving = false
  isEditMode = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private universityService: UniversityService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadUniversities()
    this.loadStats()
  }

  getPublicUniversitiesCount(): number {
    return this.stats?.byType?.find((t: any) => t.type === "publica")?.count || 0
  }

  getPrivateUniversitiesCount(): number {
    return this.stats?.byType?.find((t: any) => t.type === "privada")?.count || 0
  }

  getCountriesCount(): number {
    return this.stats?.byCountry?.length || 0
  }

  private initForm(): void {
    this.universityForm = this.fb.group({
      name: ["", [Validators.required]],
      country: ["", [Validators.required]],
      location: [""],
      description: [""],
      type: ["", [Validators.required]],
      modality: ["", [Validators.required]],
      website: [""],
      contact_email: ["", [Validators.email]],
      contact_phone: [""],
      admission_requirements: [""],
      rating: [0, [Validators.min(0), Validators.max(5)]],
    })
  }

  loadUniversities(): void {
    this.isLoading = true
    this.errorMessage = ""

    this.universityService.getUniversities({ limit: 100 }).subscribe({
      next: (response) => {
        this.universities = response.universities
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.error || "Error cargando universidades"
        console.error("Error loading universities:", error)
      },
    })
  }

  loadStats(): void {
    this.adminService.getUniversitiesStats().subscribe({
      next: (stats) => {
        this.stats = stats
      },
      error: (error) => {
        console.error("Error loading stats:", error)
      },
    })
  }

  openCreateModal(): void {
    this.isEditMode = false
    this.selectedUniversity = null
    this.universityForm.reset()
    const modal = new (window as any).bootstrap.Modal(document.getElementById("universityModal"))
    modal.show()
  }

  viewUniversity(university: University): void {
    // Navegar a la página de detalles
    window.open(`/universities/${university.id}`, "_blank")
  }

  editUniversity(university: University): void {
    this.isEditMode = true
    this.selectedUniversity = university
    this.universityForm.patchValue(university)
    const modal = new (window as any).bootstrap.Modal(document.getElementById("universityModal"))
    modal.show()
  }

  deleteUniversity(university: University): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la universidad ${university.name}?`)) {
      this.adminService.deleteUniversity(university.id).subscribe({
        next: () => {
          this.loadUniversities()
          this.loadStats()
          alert("Universidad eliminada exitosamente")
        },
        error: (error) => {
          console.error("Error deleting university:", error)
          alert("Error eliminando universidad: " + (error.error?.error || "Error desconocido"))
        },
      })
    }
  }

  saveUniversity(): void {
    if (this.universityForm.valid) {
      this.isSaving = true
      const formData = this.universityForm.value

      const request = this.isEditMode
        ? this.adminService.updateUniversity(this.selectedUniversity!.id, formData)
        : this.adminService.createUniversity(formData)

      request.subscribe({
        next: () => {
          this.isSaving = false
          this.loadUniversities()
          this.loadStats()
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("universityModal"))
          modal.hide()
          alert(`Universidad ${this.isEditMode ? "actualizada" : "creada"} exitosamente`)
        },
        error: (error) => {
          this.isSaving = false
          console.error("Error saving university:", error)
          alert("Error guardando universidad: " + (error.error?.error || "Error desconocido"))
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.universityForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  private markFormGroupTouched(): void {
    Object.keys(this.universityForm.controls).forEach((key) => {
      const control = this.universityForm.get(key)
      control?.markAsTouched()
    })
  }

  getModalityLabel(modality: string): string {
    const labels: { [key: string]: string } = {
      presencial: "Presencial",
      virtual: "Virtual",
      hibrida: "Híbrida",
    }
    return labels[modality] || modality
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  exportUniversities(): void {
    const exportData = {
      fecha_exportacion: new Date().toISOString(),
      total_universidades: this.universities.length,
      estadisticas: this.stats,
      universidades: this.universities.map((uni) => ({
        id: uni.id,
        nombre: uni.name,
        pais: uni.country,
        ubicacion: uni.location,
        tipo: uni.type,
        modalidad: uni.modality,
        rating: uni.rating,
        carreras: uni.career_count || 0,
        sitio_web: uni.website,
        email_contacto: uni.contact_email,
        telefono_contacto: uni.contact_phone,
      })),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `universidades_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
  }
}
