import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { CareerService } from "../../../core/services/career.service"
import { Career } from "../../../core/models/career.model"

@Component({
  selector: "app-career-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5" *ngIf="career">
      <!-- 🧭 Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <a routerLink="/careers" class="text-decoration-none text-primary">Carreras</a>
          </li>
          <li class="breadcrumb-item active">{{ career.name }}</li>
        </ol>
      </nav>

      <!-- 🪪 Card principal -->
      <div class="card shadow border-0 rounded-4 overflow-hidden">
        <div class="card-body px-4 px-md-5 py-5">
          <!-- Encabezado -->
          <div class="d-flex align-items-center mb-4">
            <div>
              <h1 class="fw-bold text-primary mb-1">{{ career.name }}</h1>
              <span class="badge bg-info px-3 py-2">
                {{ career.duration_years }} años
              </span>
            </div>
          </div>

          <!-- Descripción -->
          <section class="mb-5">
            <h4 class="text-secondary fw-semibold mb-3">Descripción de la carrera</h4>
            <p class="lead text-justify mb-0">{{ career.description }}</p>
          </section>

          <!-- Aptitudes -->
          <section *ngIf="career.aptitudes && career.aptitudes.length > 0">
            <h4 class="text-secondary fw-semibold mb-4">Aptitudes relacionadas</h4>

            <div class="row row-cols-1 row-cols-md-2 g-4">
              <div *ngFor="let aptitude of career.aptitudes" class="col">
                <div class="aptitude-item p-4 border rounded-4 h-100 shadow-sm">
                  <h6 class="fw-bold text-primary mb-2">{{ aptitude.name }}</h6>
                  <p class="text-muted mb-0 small">{{ aptitude.description }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    

    <!-- Estado de carga -->
    <div *ngIf="!career" class="container py-5 text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5>Cargando información de la carrera...</h5>
    </div>
  `,
  styles: [`
    /* General layout */
    .card {
      background: linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%);
    }

    .lead {
      font-size: 1.1rem;
      line-height: 1.7;
      color: #495057;
    }

    .text-secondary {
      color: #6c757d !important;
    }

    /* Aptitudes */
    .aptitude-item {
      transition: all 0.3s ease;
      background-color: #ffffff;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
    }

    .aptitude-item:hover {
      transform: translateY(-5px);
      background-color: #f8f9fa;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: #0d6efd;
    }

    /* Badge y títulos */
    .badge.bg-info {
      background-color: #0dcaf0 !important;
      font-size: 0.9rem;
      font-weight: 500;
    }

    h1, h4, h6 {
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    }

    .breadcrumb {
      background: transparent;
      padding: 0;
      margin-bottom: 1rem;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      color: #6c757d;
    }
  `]
})
export class CareerDetailComponent implements OnInit {
  career: Career | null = null

  constructor(
    private route: ActivatedRoute,
    private careerService: CareerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.careerService.getCareerById(Number(id)).subscribe({
        next: (career) => (this.career = career),
        error: () => (this.career = null)
      })
    }
  }
}
