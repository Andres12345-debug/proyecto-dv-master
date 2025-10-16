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
              Explorar Universidades
            </h1>
            <p class="lead text-muted">
              Encuentra la universidad perfecta para tu futuro académico
            </p>
          </div>
        </div>
      </div>

      <!-- Filters (alineados en una línea) -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="filter-form d-flex flex-wrap align-items-end gap-3">
            <div class="filter-item flex-grow-1">
              <label for="search" class="form-label mb-1">Buscar</label>
              <input
                type="text"
                id="search"
                class="form-control"
                formControlName="search"
                placeholder="Nombre de universidades..."
              />
            </div>

            <div class="filter-item">
              <label for="location" class="form-label mb-1">Ciudad</label>
              <select id="location" class="form-select" formControlName="location">
                <option value="">Todas</option>
                <option *ngFor="let location of countries" [value]="location">
                  {{ location }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label for="type" class="form-label mb-1">Tipo</label>
              <select id="type" class="form-select" formControlName="type">
                <option value="">Todos</option>
                <option value="publica">Pública</option>
                <option value="privada">Privada</option>
              </select>
            </div>

            <div class="filter-item">
              <label for="modality" class="form-label mb-1">Modalidad</label>
              <select id="modality" class="form-select" formControlName="modality">
                <option value="">Todas</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrida">Híbrida</option>
              </select>
            </div>

            <div class="filter-item button-container">
              <button type="button" class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                <i class="bi bi-arrow-repeat me-1"></i> Volver a cargar
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
                  <i class="bi bi-grid-fill"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  [class.active]="viewMode === 'list'"
                  (click)="viewMode = 'list'"
                >
                  <i class="bi bi-hdd-stack-fill"></i>
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
          [class]="viewMode === 'grid' ? 'col-lg-6 col-md-6 mb-4' : 'col-12 mb-3'"
        >
          <div class="university-card h-100" [class.list-view]="viewMode === 'list'">
            <!-- Header organizado -->
            <div class="university-header mb-3 pb-2 border-bottom">
              <div class="d-flex justify-content-between align-items-start gap-3">
                <h5 class="university-name mb-0 flex-grow-1">{{ university.name }}</h5>
                <div class="rating-pill">
                  <span class="rating-value">{{ university.rating }}</span>
                </div>
              </div>
              <div class="university-location text-muted mt-2">
                {{ university.location }}, {{ university.country }}
              </div>
            </div>

            <!-- Badges -->
            <div class="university-badges mb-3">
              <span class="badge me-2" [class]="getTypeBadgeClass(university.type)">
                {{ getTypeLabel(university.type) }}
              </span>
              <span class="badge bg-secondary">{{ getModalityLabel(university.modality) }}</span>
            </div>

            <!-- Descripción -->
            <p class="university-description text-muted mb-3" *ngIf="university.description">
              {{ truncateText(university.description, 160) }}
            </p>

            <!-- Stats -->
            <div class="university-stats mb-2" *ngIf="university.career_count">
              <small class="text-muted">
                {{ university.career_count }} carreras disponibles
              </small>
            </div>

            <!-- Footer -->
            <div class="university-footer mt-auto pt-3 border-top">
              <div class="d-flex justify-content-between align-items-center">
                <div class="contact-info" *ngIf="university.website">
                  <a [href]="university.website" target="_blank" class="text-decoration-none">
                    Sitio web
                  </a>
                </div>
                <a [routerLink]="['/universities', university.id]" class="btn btn-primary">
                  Ver más
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
                  <i class="bi bi-caret-left-fill"></i>
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
                  <i class="bi bi-caret-right-fill"></i>
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
          <i class="bi bi-emoji-frown mb-3" style="font-size: 80px; color: #6c757d;"></i>
          <h4>No se encontraron universidades</h4>
          <p class="text-muted mb-4">
            Intenta ajustar tus filtros de búsqueda para encontrar más resultados
          </p>
          <button class="btn btn-primary" (click)="clearFilters()">
            <i class="bi bi-arrow-repeat me-2"></i>Volver a intentar
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadUniversities()">
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid { padding-left: 3rem; padding-right: 3rem; }

    .page-header { text-align: center; margin-bottom: 3rem; }

    /* === FILTROS ALINEADOS === */
    .filter-form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 1.25rem; }
    .filter-item { display: flex; flex-direction: column; min-width: 160px; }
    .filter-item input, .filter-item select {
      height: 45px; font-size: 0.95rem; border-radius: 8px; border: 1px solid #ced4da; padding: 0.375rem 0.75rem;
    }
    .filter-item select:focus, .filter-item input:focus {
      border-color: #667eea; box-shadow: 0 0 0 0.1rem rgba(102,126,234,0.3); outline: none;
    }
    .button-container { display: flex; align-items: flex-end; }
    .button-container .btn { height: 45px; border-radius: 8px; font-weight: 500; }

    /* === TARJETAS ORGANIZADAS === */
    .university-card {
      background: #fff; border: 1px solid #e9ecef; border-radius: 16px;
      padding: 28px; transition: all 0.25s ease; display: flex; flex-direction: column; min-height: 100%;
    }
    .university-card:hover {
      transform: translateY(-6px); box-shadow: 0 18px 40px rgba(0,0,0,.08); border-color: #667eea; background-color: #fcfdff;
    }

    .university-header { margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f0f0f0; }
    .university-name { color: #2c3e50; font-weight: 700; font-size: 1.25rem; line-height: 1.35; }
    .university-location { font-size: .95rem; color: #6c757d; }

    .rating-pill {
      background: #fff3cd; border: 1px solid #ffe69c; color: #8a6d3b; border-radius: 999px;
      padding: 4px 10px; min-width: 44px; text-align: center; font-weight: 600; font-size: .9rem;
    }

    .university-badges { margin-bottom: 1rem; }
    .badge { font-size: .85rem; padding: .5em .75em; }
    .badge.bg-success { background-color: #28a745 !important; }
    .badge.bg-info { background-color: #17a2b8 !important; }

    .university-description { font-size: .95rem; line-height: 1.65; color: #495057; margin-bottom: .75rem; }
    .university-stats small { font-size: .9rem; color: #6c757d; }

    .university-footer { margin-top: auto; }
    .contact-info a { color: #6c757d; font-size: .95rem; }
    .contact-info a:hover { color: #667eea; }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; transition: all .25s ease;
      padding: .55rem 1.15rem; font-weight: 500;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(102,126,234,.25); }

    .view-options .btn { border-radius: 8px; padding: 6px 10px; }
    .view-options .btn.active { background-color: #667eea; border-color: #667eea; color: #fff; }

    .pagination .page-link { border-color: #e9ecef; color: #6c757d; padding: .5rem .9rem; }
    .pagination .page-item.active .page-link { background-color: #667eea; border-color: #667eea; }
    .pagination .page-link:hover { background-color: #f8f9fa; border-color: #667eea; color: #667eea; }

    @media (max-width: 992px) {
      .container-fluid { padding-left: 1.5rem; padding-right: 1.5rem; }
      .filter-form { flex-direction: column; align-items: stretch; }
      .filter-item { width: 100%; }
      .button-container .btn { width: 100%; }
      .university-card { padding: 22px; }
    }
  `],
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

  locations: string[] = []
  constructor(
    private fb: FormBuilder,
    private universityService: UniversityService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.universityService.getCountries().subscribe({
      next: (cities) => (this.locations = cities),
      error: () => (this.locations = []),
    })
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
      next: (countries) => { this.countries = countries },
      error: (error) => { console.error("Error loading countries:", error) },
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
    for (let i = startPage; i <= endPage; i++) pages.push(i)
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
    return text.substring(0, maxLength) + "…"
  }
}
