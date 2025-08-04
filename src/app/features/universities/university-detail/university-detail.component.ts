import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { UniversityService } from "../../../core/services/university.service"
import { LoadingService } from "../../../core/services/loading.service"
import { University } from "../../../core/models/university.model"

@Component({
  selector: "app-university-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4" *ngIf="university">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/universities">Universidades</a>
              </li>
              <li class="breadcrumb-item active">{{ university.name }}</li>
            </ol>
          </nav>
        </div>
      </div>

      <!-- University Header -->
      <div class="card shadow-lg border-0 mb-4">
        <div class="card-body p-5">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="display-5 fw-bold text-primary-custom mb-3">
                {{ university.name }}
              </h1>
              <div class="university-meta mb-3">
                <div class="d-flex flex-wrap gap-3 align-items-center">
                  <div class="location">
                    <i class="material-icons me-2">{{ university.location }}, {{ university.country }}</i>
                  </div>
                  <div class="rating">
                    <i class="material-icons me-1 text-warning">star</i>
                    <span class="fw-bold">{{ university.rating }}</span>
                    <span class="text-muted">/5.0</span>
                  </div>
                </div>
              </div>
              <div class="badges mb-3">
                <span class="badge me-2" [class]="getTypeBadgeClass(university.type)">
                  {{ getTypeLabel(university.type) }}
                </span>
                <span class="badge bg-secondary">{{ getModalityLabel(university.modality) }}</span>
              </div>
            </div>
            <div class="col-md-4 text-md-end">
              <div class="university-actions">
                <a
                  *ngIf="university.website"
                  [href]="university.website"
                  target="_blank"
                  class="btn btn-outline-primary btn-lg mb-2 w-100"
                >
                  <i class="material-icons me-3"><i class="bi bi-geo"></i>Visitar Sitio Web</i>

                </a>
                <button class="btn btn-primary btn-lg w-100">
                  <i class="material-icons me-2">Contactar Universidad</i>

                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Description -->
          <div class="card shadow-sm mb-4" *ngIf="university.description">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="material-icons me-2">Acerca de la Universidad</i>

              </h4>
            </div>
            <div class="card-body">
              <p class="lead">{{ university.description }}</p>
            </div>
          </div>

          <!-- Careers -->
          <div class="card shadow-sm mb-4" *ngIf="university.careers && university.careers.length > 0">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="material-icons me-2">Carreras Disponibles ({{ university.careers.length }})</i>

              </h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div
                  *ngFor="let career of university.careers"
                  class="col-md-6 mb-3"
                >
                  <div class="career-card">
                    <h6 class="career-name">{{ career.name }}</h6>
                    <p class="career-description text-muted" *ngIf="career.description">
                      {{ career.description }}
                    </p>
                    <div class="career-meta" *ngIf="career.duration_years">
                      <small class="text-muted">
                        <i class="material-icons me-1">{{ career.duration_years }} años</i>

                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aptitudes -->
          <div class="card shadow-sm mb-4" *ngIf="university.aptitudes && university.aptitudes.length > 0">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="material-icons me-2">Aptitudes Relacionadas</i>

              </h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div
                  *ngFor="let aptitude of university.aptitudes"
                  class="col-md-6 mb-3"
                >
                  <div class="aptitude-card">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <h6 class="mb-0">{{ aptitude.name }}</h6>
                      <span class="strength-badge">{{ aptitude.strength_level }}%</span>
                    </div>
                    <div class="progress mb-2" style="height: 6px;">
                      <div
                        class="progress-bar bg-primary"
                        role="progressbar"
                        [style.width.%]="aptitude.strength_level"
                        [attr.aria-valuenow]="aptitude.strength_level"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small class="text-muted">{{ aptitude.description }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Admission Requirements -->
          <div class="card shadow-sm mb-4" *ngIf="university.admission_requirements">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="material-icons me-2">assignment</i>
                Requisitos de Admisión
              </h4>
            </div>
            <div class="card-body">
              <div class="requirements-content">
                {{ university.admission_requirements }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Contact Info -->
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2"></i>
                Información de Contacto
              </h5>
            </div>
            <div class="card-body">
              <div class="contact-item mb-3" *ngIf="university.contact_email">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-3 text-primary">email</i>
                  <div>
                    <strong>Email</strong><br>
                    <a [href]="'mailto:' + university.contact_email" class="text-decoration-none">
                      {{ university.contact_email }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="contact-item mb-3" *ngIf="university.contact_phone">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-3 text-primary">phone</i>
                  <div>
                    <strong>Teléfono</strong><br>
                    <a [href]="'tel:' + university.contact_phone" class="text-decoration-none">
                      {{ university.contact_phone }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="contact-item" *ngIf="university.website">
                <div class="d-flex align-items-center">
                  <i class="material-icons me-3 text-primary"></i>
                  <div>
                    <strong>Sitio Web</strong><br>
                    <a [href]="university.website" target="_blank" class="text-decoration-none">
                      {{ getDomainFromUrl(university.website) }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2">Estadísticas</i>

              </h5>
            </div>
            <div class="card-body">
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Tipo de Universidad</span>
                  <strong>{{ getTypeLabel(university.type) }}</strong>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Modalidad</span>
                  <strong>{{ getModalityLabel(university.modality) }}</strong>
                </div>
              </div>
              <div class="stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span>Carreras Disponibles</span>
                  <strong>{{ university.careers?.length || 0 }}</strong>
                </div>
              </div>
              <div class="stat-item">
                <div class="d-flex justify-content-between">
                  <span>Calificación</span>
                  <strong>{{ university.rating }}/5.0</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="mb-3">¿Interesado en esta universidad?</h6>
              <div class="d-grid gap-2">
                <button class="btn btn-primary">
                  <i class="material-icons me-2">Guardar en Favoritos</i>

                </button>
                <button class="btn btn-outline-secondary">
                  <i class="material-icons me-2">Compartir</i>

                </button>
                <a routerLink="/test" class="btn btn-outline-info">
                  <i class="material-icons me-2">Hacer Test Vocacional</i>

                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!university && !errorMessage" class="container py-5">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <h5>Cargando información de la universidad...</h5>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="errorMessage" class="container py-5">
      <div class="alert alert-danger">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <div class="mt-3">
          <a routerLink="/universities" class="btn btn-primary">
            Volver a Universidades
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .university-meta {
      font-size: 1.1rem;
    }

    .location, .rating {
      display: flex;
      align-items: center;
    }

    .badges .badge {
      font-size: 0.9rem;
      padding: 8px 12px;
    }

    .badge.bg-success { background-color: #28a745 !important; }
    .badge.bg-info { background-color: #17a2b8 !important; }

    .university-actions .btn {
      transition: all 0.3s ease;
    }

    .university-actions .btn:hover {
      transform: translateY(-2px);
    }

    .career-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      height: 100%;
      transition: all 0.3s ease;
    }

    .career-card:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }

    .career-name {
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .career-description {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .career-meta i {
      font-size: 16px;
    }

    .aptitude-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      transition: all 0.3s ease;
    }

    .aptitude-card:hover {
      background: #e9ecef;
    }

    .strength-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .progress-bar {
      background: linear-gradient(90deg, #667eea, #764ba2) !important;
    }

    .contact-item {
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .contact-item:last-child {
      border-bottom: none;
    }

    .contact-item a {
      color: #667eea;
    }

    .contact-item a:hover {
      color: #764ba2;
    }

    .stat-item {
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .requirements-content {
      white-space: pre-line;
      line-height: 1.6;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    @media (max-width: 768px) {
      .university-actions .btn {
        margin-bottom: 10px;
      }

      .career-card, .aptitude-card {
        margin-bottom: 15px;
      }
    }
  `,
  ],
})
export class UniversityDetailComponent implements OnInit {
  university: University | null = null
  errorMessage = ""

  constructor(
    private route: ActivatedRoute,
    private universityService: UniversityService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadUniversity(Number.parseInt(id))
    } else {
      this.errorMessage = "ID de universidad inválido"
    }
  }

  private loadUniversity(id: number): void {
    this.loadingService.show()
    this.universityService.getUniversityById(id).subscribe({
      next: (university) => {
        this.university = university
        this.loadingService.hide()
      },
      error: (error) => {
        this.loadingService.hide()
        this.errorMessage = error.error?.error || "Error cargando la información de la universidad"
        console.error("Error loading university:", error)
      },
    })
  }

  getTypeBadgeClass(type: string): string {
    return type === "publica" ? "bg-success" : "bg-info"
  }

  getTypeLabel(type: string): string {
    return type === "publica" ? "Pública" : "Privada"
  }

  getModalityLabel(modality: string): string {
    const labels: { [key: string]: string } = {
      presencial: "Presencial",
      virtual: "Virtual",
      hibrida: "Híbrida",
    }
    return labels[modality] || modality
  }

  getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      return domain.replace("www.", "")
    } catch {
      return url
    }
  }
}
