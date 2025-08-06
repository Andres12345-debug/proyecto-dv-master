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
    <div class="container py-4" *ngIf="career">
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/careers">Carreras</a></li>
          <li class="breadcrumb-item active">{{ career.name }}</li>
        </ol>
      </nav>

      <div class="card shadow-lg border-0 mb-4">
        <div class="card-body p-5">
          <h1 class="display-5 fw-bold text-primary mb-3">{{ career.name }}</h1>
          <div class="mb-3">
            <span class="badge bg-info">{{ career.duration_years }} años</span>
          </div>
          <p class="lead">{{ career.description }}</p>
        </div>
      </div>

      <div class="card shadow-sm mb-4" *ngIf="career.aptitudes && career.aptitudes.length > 0">
        <div class="card-header">
          <h4 class="mb-0">Aptitudes Relacionadas</h4>
        </div>
        <div class="card-body">
          <ul>
            <li *ngFor="let aptitude of career.aptitudes">
              <strong>{{ aptitude.name }}</strong>: {{ aptitude.description }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div *ngIf="!career" class="container py-5 text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5>Cargando información de la carrera...</h5>
    </div>
  `,
  styles: [`
    .badge.bg-info { background-color: #17a2b8 !important; }
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
        next: (career) => this.career = career,
        error: () => this.career = null
      })
    }
  }
}