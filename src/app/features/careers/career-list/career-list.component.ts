import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { CareerService } from "../../../core/services/career.service"
import { TestService } from "../../../core/services/test.service"
import { Career } from "../../../core/models/career.model"

@Component({
  selector: "app-career-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="page-header">
        <h1 class="display-6 fw-bold text-primary-custom mb-2">
          <i class="material-icons me-3"></i>
          Explorar Tus Carreras
        </h1>
        <p class="lead text-muted">
          Encuentra la carrera perfecta para tu futuro académico y profesional.
        </p>
      </div>

      <!-- 🔎 Buscador solo front -->
      <div class="row g-2 mb-4">
        <div class="col-sm-8 col-md-6">
          <input
            class="form-control"
            type="text"
            placeholder="Buscar por nombre (p. ej. Ingeniería)"
            [(ngModel)]="search"
            name="search"
          />
        </div>
      </div>

      <div class="row">
        <div *ngFor="let career of filteredCareers" class="col-md-6 mb-4">
          <div class="card career-card shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-semibold text-primary">{{ career.name }}</h5>
              <p class="card-text text-muted">{{ career.description }}</p>
              <div>
                <span class="badge bg-info">{{ career.duration_years }} años</span>
              </div>
              <a
                [routerLink]="['/careers', career.id]"
                class="btn btn-outline-primary mt-3"
              >
                Ver Detalle
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .career-card {
      border-radius: 12px;
      transition: all 0.25s ease-in-out;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      background-color: #ffffff;
    }

    .career-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      border-color: #0d6efd;
      background-color: #f8f9fa;
    }

    .career-card .card-title {
      transition: color 0.25s ease;
    }

    .career-card:hover .card-title {
      color: #0d6efd;
    }

    .btn-outline-primary {
      transition: all 0.25s ease;
    }

    .career-card:hover .btn-outline-primary {
      background-color: #0d6efd;
      color: #fff;
      border-color: #0d6efd;
    }
  `]
})
export class CareerListComponent implements OnInit {
  careers: Career[] = []
  search = ""

  constructor(
    private careerService: CareerService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    // ✅ Cargar todas las carreras desde el backend
    this.careerService.getAllCareers().subscribe({
      next: (data) => {
        this.careers = [...this.careers, ...data]
      },
      error: (err) => console.error("Error al cargar carreras:", err)
    })

    // ✅ Cargar carreras recomendadas por el test
    this.testService.getAllCareers().subscribe({
      next: (data) => {
        const nuevas: Career[] = data.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description ?? '',
          duration_years: c.duration_years ?? 0,
          aptitudes: c.aptitudes ?? []
        }))

        const sinDuplicados = nuevas.filter(
          tCareer => !this.careers.some(c => c.id === tCareer.id)
        )

        this.careers = [...this.careers, ...sinDuplicados]
      },
      error: (err) => console.error("Error al listar todas las carreras:", err)
    })
  }

  // 🔍 Filtro en memoria
  get filteredCareers(): Career[] {
    const q = this.normalize(this.search)
    if (!q) return this.careers
    return this.careers.filter(c =>
      this.normalize(c.name).includes(q)
    )
  }

  private normalize(s: string): string {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }
}
