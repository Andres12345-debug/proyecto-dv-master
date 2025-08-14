import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { UniversityService } from "../../../core/services/university.service"
import { LoadingService } from "../../../core/services/loading.service"
import { University, UniversityFilters } from "../../../core/models/university.model"
import { debounceTime, distinctUntilChanged } from "rxjs/operators"

@Component({
  selector: "app-university-list",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="page-header">
            <h1 class="display-6 fw-bold text-primary-custom mb-2">
              <i class="material-icons me-3"></i>
              Explorar Universidades
            </h1>
            <p class="lead text-muted">
              Encuentra la universidad perfecta para tu futuro académicoOOOO
            </p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-4">
              <label for="search" class="form-label">
                <i class="material-icons me-1"></i>
                Buscar
              </label>
              <input
                type="text"
                id="search"
                class="form-control"
                formControlName="search"
                placeholder="Nombre de universidad, carrera..."
              >
            </div>
            <div class="col-md-2">
              <label for="country" class="form-label">
                <i class="material-icons me-1"></i>
                Ciudad
              </label>
              <select id="location" class="form-select" formControlName="location">
                <option value="">Todas las ciudades</option>
                <option *ngFor="let location of countries" [value]="location">
                  {{ location }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="type" class="form-label">
                <i class="material-icons me-1"></i>
                Tipo
              </label>
              <select id="type" class="form-select" formControlName="type">
                <option value="">Todos los tipos</option>
                <option value="publica">Pública</option>
                <option value="privada">Privada</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="modality" class="form-label">
                <i class="material-icons me-1"></i>
                Modalidad
              </label>
              <select id="modality" class="form-select" formControlName="modality">
                <option value="">Todas las modalidades</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrida">Híbrida</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button type="button" class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                <i class="material-icons me-1"></i><i class="bi bi-arrow-repeat"></i>
                Volver a cargar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Results Info -->
      <div class="row mb-3" *ngIf="universities.length > 0 || isLoading">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="results-info">
              <span class="text-muted">
                Mostrando {{ universities.length }} de {{ totalUniversities }} universidades
              </span>
            </div>
            <div class="view-options">
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  [class.active]="viewMode === 'grid'"
                  (click)="viewMode = 'grid'"
                >
                  <i class="material-icons"><i class="bi bi-grid-fill"></i></i>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  [class.active]="viewMode === 'list'"
                  (click)="viewMode = 'list'"
                >
                  <i class="material-icons"><i class="bi bi-hdd-stack-fill"></i></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Universities Grid/List -->
      <div class="row" *ngIf="!isLoading && universities.length > 0">
        <div
          *ngFor="let university of universities"
          [class]="viewMode === 'grid' ? 'col-lg-4 col-md-6 mb-4' : 'col-12 mb-3'"
        >
          <div class="university-card h-100" [class.list-view]="viewMode === 'list'">
            <div class="university-header">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="university-name mb-0">{{ university.name }}</h5>
                <div class="rating">
                  <i class="material-icons text-warning"><i class="bi bi-star-fill"></i></i>
                  <span>{{ university.rating }}</span>
                </div>    
              </div>
              <div class="university-location text-muted mb-3">
                <i class="material-icons me-1">{{ university.location }}, {{ university.country }}</i>

              </div>
            </div>

            <div class="university-body flex-grow-1">
              <div class="university-badges mb-3">
                <span class="badge me-2" [class]="getTypeBadgeClass(university.type)">
                  {{ getTypeLabel(university.type) }}
                </span>
                <span class="badge bg-secondary">{{ getModalityLabel(university.modality) }}</span>
              </div>

              <p class="university-description text-muted" *ngIf="university.description">
                {{ truncateText(university.description, 120) }}
              </p>

              <div class="university-stats" *ngIf="university.career_count">
                <small class="text-muted">
                  <i class="material-icons me-1">{{ university.career_count }} carreras disponibles</i>
                </small>
              </div>
            </div>

            <div class="university-footer mt-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="contact-info" *ngIf="university.website">
                  <a [href]="university.website" target="_blank" class="text-decoration-none">
                    <i class="material-icons me-1">Sitio web</i>

                  </a>
                </div>
                <a [routerLink]="['/universities', university.id]" class="btn btn-primary">
                  <i class="material-icons me-1"><i class="bi bi-box-arrow-in-up-left"></i>Ver más</i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="row mt-4" *ngIf="totalPages > 1">
        <div class="col-12">
          <nav aria-label="Paginación de universidades">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <button class="page-link" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
                  <i class="material-icons"><i class="bi bi-caret-left-fill"></i></i>
                </button>
              </li>

              <li
                *ngFor="let page of getPageNumbers()"
                class="page-item"
                [class.active]="page === currentPage"
              >
                <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
              </li>

              <li class="page-item" [class.disabled]="currentPage === totalPages">
                <button class="page-link" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
                  <i class="material-icons"><i class="bi bi-caret-right-fill"></i></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando universidades...</span>
        </div>
        <h5>Cargando universidades...</h5>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && universities.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="material-icons mb-3"><i class="bi bi-emoji-frown"></i></i>
          <h4>No se encontraron universidades</h4>
          <p class="text-muted mb-4">
            Intenta ajustar tus filtros de búsqueda para encontrar más resultados
          </p>
          <button class="btn btn-primary" (click)="clearFilters()">
            <i class="material-icons me-5"><i class="bi bi-arrow-repeat"></i></i>
            volver a intentar 
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadUniversities()">
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .university-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .university-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }

    .university-card.list-view {
      flex-direction: row;
      align-items: center;
      padding: 20px;
    }

    .university-card.list-view .university-header {
      flex: 1;
      margin-right: 20px;
    }

    .university-card.list-view .university-body {
      flex: 2;
      margin-right: 20px;
    }

    .university-card.list-view .university-footer {
      flex: 0 0 auto;
      margin-top: 0;
    }

    .university-name {
      color: #333;
      font-weight: 600;
      line-height: 1.3;
    }

    .university-location {
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    .university-location i {
      font-size: 16px;
    }

    .rating {
      display: flex;
      align-items: center;
      font-weight: 500;
      gap: 4px;
    }

    .university-description {
      font-size: 14px;
      line-height: 1.5;
    }

    .university-stats {
      display: flex;
      align-items: center;
    }

    .university-stats i {
      font-size: 16px;
    }

    .contact-info a {
      color: #6c757d;
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    .contact-info a:hover {
      color: #667eea;
    }

    .contact-info i {
      font-size: 16px;
    }

    .badge.bg-success { background-color: #28a745 !important; }
    .badge.bg-info { background-color: #17a2b8 !important; }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(132, 154, 252, 0.3);
    }

    .view-options .btn.active {
      background-color: #667eea;
      border-color: #667eea;
      color: white;
    }

    .empty-state i {
      font-size: 80px;
      color: #6c757d;
    }

    .pagination .page-link {
      border-color: #e9ecef;
      color: #6c757d;
    }

    .pagination .page-item.active .page-link {
      background-color: #667eea;
      border-color: #667eea;
    }

    .pagination .page-link:hover {
      background-color: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    @media (max-width: 768px) {
      .university-card.list-view {
        flex-direction: column;
        align-items: stretch;
      }

      .university-card.list-view .university-header,
      .university-card.list-view .university-body {
        margin-right: 0;
        margin-bottom: 15px;
      }

      .university-card.list-view .university-footer {
        margin-top: 15px;
      }

      .view-options {
        margin-top: 10px;
      }
    }
  `,
  ],
})
export class UniversityListComponent implements OnInit {
  filterForm!: FormGroup
  universities: University[] = []
  countries: string[] = []
  currentPage = 1
  totalPages = 1
  totalUniversities = 0
  viewMode: "grid" | "list" = "grid"
  isLoading = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private universityService: UniversityService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadCountries()
    this.loadUniversities()
    this.setupFormSubscriptions()
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      search: [""],
      country: [""],
      type: [""],
      modality: [""],
    })
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1
      this.loadUniversities()
    })
  }

  private loadCountries(): void {
    this.universityService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries
      },
      error: (error) => {
        console.error("Error loading countries:", error)
      },
    })
  }

  loadUniversities(): void {
    this.isLoading = true
    this.errorMessage = ""

    const filters: UniversityFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: 12,
    }

    // Remover valores vacíos
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof UniversityFilters] === "") {
        delete filters[key as keyof UniversityFilters]
      }
    })

    this.universityService.getUniversities(filters).subscribe({
      next: (response) => {
        this.universities = response.universities
        this.totalPages = response.pagination.pages
        this.totalUniversities = response.pagination.total
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.error || "Error cargando universidades"
        console.error("Error loading universities:", error)
      },
    })
  }

  clearFilters(): void {
    this.filterForm.reset()
    this.currentPage = 1
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.loadUniversities()
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = []
    const maxPages = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1)

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
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

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
}
