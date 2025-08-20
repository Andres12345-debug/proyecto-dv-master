import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { CareerService } from "../../../core/services/career.service"
import { TestService } from "../../../core/services/test.service"
import { Career } from "../../../core/models/career.model"

@Component({
  selector: "app-career-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="page-header">
        <h1 class="display-6 fw-bold text-primary-custom mb-2">
          <i class="material-icons me-3"></i>
          Explorar Carreras
        </h1>
        <p class="lead text-muted">
          Encuentra la carrera perfecta para tu futuro académico y profesional.
        </p>
      </div>

      <div class="row">
        <div *ngFor="let career of careers" class="col-md-6 mb-3">
          <div class="card shadow-sm career-card">
            <div class="card-body">
              <h5 class="card-title">{{ career.name }}</h5>
              <p class="card-text text-muted">{{ career.description }}</p>
              <div>
                <span class="badge bg-info">{{ career.duration_years }} años</span>
              </div>
              <a [routerLink]="['/careers', career.id]" class="btn btn-outline-primary mt-3">
                Ver Detalle
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .career-card { border-radius: 10px; }
    .career-card:hover { background: #f8f9fa; }
  `]
})
export class CareerListComponent implements OnInit {
  careers: Career[] = []

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
      error: (err) => {
        console.error("Error al cargar carreras:", err)
      }
    })

    // ✅ Cargar carreras recomendadas por el test
    this.testService.getTestResults(1).subscribe({
      next: (test) => {
        if (Array.isArray(test.careers)) {
          const nuevas: Career[] = test.careers.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description ?? '',
            duration_years: c.duration_years ?? 0,
            aptitudes: []
          }))

          // Evitar duplicados
          const sinDuplicados = nuevas.filter(
            tCareer => !this.careers.some(c => c.id === tCareer.id)
          )

          this.careers = [...this.careers, ...sinDuplicados]
        }
      },
      error: (err) => {
        console.error("Error al cargar resultados del test:", err)
      }
    })
  }
}
