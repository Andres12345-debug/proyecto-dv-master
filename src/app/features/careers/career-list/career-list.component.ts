import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { CareerService } from "../../../core/services/career.service"
import { Career } from "../../../core/models/career.model"

@Component({
  selector: "app-career-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Listado de Carreras</h2>
      <div class="row">
        <div *ngFor="let career of careers" class="col-md-6 mb-3">
          <div class="card shadow-sm career-card">
            <div class="card-body">
              <h5 class="card-title">{{ career.name }}</h5>
              <p class="card-text text-muted">{{ career.description }}</p>
              <div>
                <span class="badge bg-info">{{ career.duration_years }} años</span>
              </div>
              <a [routerLink]="['/careers', career.id]" class="btn btn-outline-primary mt-3">Ver Detalle</a>
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

  constructor(private careerService: CareerService) {}

  ngOnInit(): void {
    this.careerService.getCareers().subscribe({
      next: (response) => this.careers = response.data,
      error: () => this.careers = []
    })
  }
}
