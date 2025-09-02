import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../core/services/auth.service"
import { TestService } from "../../core/services/test.service"
import { UniversityService } from "../../core/services/university.service"
import { User } from "../../core/models/user.model"
import { TestResult } from "../../core/models/test.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
       <div class="col-12">
  <div class="card border-0 shadow-sm">
    <div class="card-body p-5">
      <div class="row align-items-center">
        
        <!-- Icono / Imagen a la izquierda -->
        <div class="col-md-4 text-center mb-4 mb-md-0">
          <i class="bi bi-mortarboard-fill" style="font-size: 6rem; color: #8b5cf6;"></i>


          <!-- Si quieres avatar dinámico:
          <img [src]="currentUser?.avatarUrl" 
               class="img-fluid rounded-circle" 
               alt="{{ currentUser?.name }}">
          -->
        </div>

        <!-- Texto a la derecha -->
        <div class="col-md-8 text-md-start text-center">
          <h1 class="card-title display-6 fw-bold mb-4">
            ¡Hola, <strong>{{ currentUser?.name }}</strong>! 👋
          </h1>
          <p class="lead mb-4">
  Bienvenido a tu panel de descubrimiento vocacional, <strong>{{ currentUser?.name }}</strong>. 
  Este es tu espacio personalizado para <strong>explorar, aprender y tomar decisiones inteligentes</strong> sobre tu futuro académico y profesional, donde encontrarás herramientas diseñadas para guiarte en este emocionante viaje de autoconocimiento. 
  ¡Empieza ahora y desbloquea todo tu potencial, <strong>{{ currentUser?.name }}</strong>!
</p>

          <div class="d-grid d-sm-flex gap-3">
            <a href="/test/" 
               class="btn btn-success btn-lg fw-bold px-4">
               TEST
            </a>
            <a href="/carrers" 
               class="btn btn-outline-secondary btn-lg fw-bold px-4">
               YA SE QUE ESTUDIAR
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
      </div>

      <!-- Quick Stats -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon bg-primary text-white rounded-circle mx-auto mb-3">
                <i class="bi bi-clipboard-check"></i>
              </div>
              <h3 class="h4 mb-1">{{ testHistory.length }}</h3>
              <p class="text-muted mb-0">Tests Realizados</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon bg-success text-white rounded-circle mx-auto mb-3">
                <i class="bi bi-building"></i>
              </div>
              <h3 class="h4 mb-1">{{ totalUniversities }}</h3>
              <p class="text-muted mb-0">Universidades Disponibles</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon bg-warning text-white rounded-circle mx-auto mb-3">
                <i class="bi bi-star-fill"></i>
              </div>
              <h3 class="h4 mb-1">{{ getRecommendationsCount() }}</h3>
              <p class="text-muted mb-0">Recomendaciones</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon bg-info text-white rounded-circle mx-auto mb-3">
                <i class="bi bi-person-check"></i>
              </div>
              <h3 class="h4 mb-1">{{ getProfileCompletion() }}%</h3>
              <p class="text-muted mb-0">Perfil Completo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-lightning-fill me-2 text-warning"></i>
                Acciones Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3" *ngIf="testHistory.length === 0">
                  <div class="action-card text-center p-4 border rounded-3 h-100">
                    <div class="action-icon bg-primary text-white rounded-circle mx-auto mb-3">
                      <i class="bi bi-play-fill"></i>
                    </div>
                    <h6 class="fw-semibold mb-2">Realizar Test Vocacional</h6>
                    <p class="text-muted small mb-3">
                      Descubre tus aptitudes y encuentra tu carrera ideal
                    </p>
                    <a routerLink="/test" class="btn btn-primary">
                      Comenzar Test
                    </a>
                  </div>
                </div>

                <div class="col-md-4 mb-3">
                  <div class="action-card text-center p-4 border rounded-3 h-100">
                    <div class="action-icon bg-success text-white rounded-circle mx-auto mb-3">
                      <i class="bi bi-search"></i>
                    </div>
                    <h6 class="fw-semibold mb-2">Explorar Universidades</h6>
                    <p class="text-muted small mb-3">
                      Encuentra universidades que se adapten a tu perfil
                    </p>
                    <a routerLink="/universities" class="btn btn-success">
                      Explorar
                    </a>
                  </div>
                </div>

                <div class="col-md-4 mb-3">
                  <div class="action-card text-center p-4 border rounded-3 h-100">
                    <div class="action-icon bg-info text-white rounded-circle mx-auto mb-3">
                      <i class="bi bi-person-gear"></i>
                    </div>
                    <h6 class="fw-semibold mb-2">Actualizar Perfil</h6>
                    <p class="text-muted small mb-3">
                      Mantén tu información actualizada
                    </p>
                    <a routerLink="/profile" class="btn btn-info">
                      Ver Perfil
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Recommendations -->
      <div class="row">
        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="bi bi-clock-history me-2 text-primary"></i>
                Historial de Tests
              </h5>
              <span class="badge bg-primary">{{ testHistory.length }}</span>
            </div>
            <div class="card-body">
              <div *ngIf="testHistory.length === 0" class="text-center py-5">
                <i class="bi bi-clipboard-x text-muted mb-3" style="font-size: 3rem;"></i>
                <h6 class="text-muted mb-3">No has realizado ningún test aún</h6>
                <p class="text-muted mb-4">
                  Realiza tu primer test vocacional para obtener recomendaciones personalizadas
                </p>
                <a routerLink="/test" class="btn btn-primary">
                  <i class="bi bi-play-fill me-2"></i>
                  Realizar Primer Test
                </a>
              </div>

              <div *ngIf="testHistory.length > 0">
                <div *ngFor="let test of getRecentTests()" class="test-item border-bottom pb-3 mb-3">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">Test Vocacional #{{ test.id }}</h6>
                      <p class="text-muted small mb-2">
                        <i class="bi bi-calendar3 me-1"></i>
                        {{ formatDate(test.completed_at || '') }}
                      </p>
                      <div class="d-flex flex-wrap gap-1">
                        <span
                          *ngFor="let aptitude of (test.aptitudes?.slice(0, 3) || [])"
                          class="badge bg-light text-dark border"
                        >
                          {{ aptitude.name }}
                        </span>
                      </div>
                    </div>
                    <div class="text-end">
                      <span class="badge bg-success mb-1">Completado</span>
                      <br>
                      <small class="text-muted">
                        {{ test.recommendations.length || 0 }} recomendaciones
                      </small>
                    </div>
                  </div>
                </div>

                <div class="text-center" *ngIf="testHistory.length > 3">
                  <a routerLink="/profile" class="btn btn-outline-primary">
                    Ver Todo el Historial
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0">
              <h5 class="card-title mb-0">
                <i class="bi bi-award me-2 text-warning"></i>
                Recomendaciones
              </h5>
            </div>
            <div class="card-body">
              <div *ngIf="getTopRecommendations().length === 0" class="text-center py-4">
                <i class="bi bi-mortarboard text-muted mb-3" style="font-size: 3rem;"></i>
                <h6 class="text-muted mb-3">Sin recomendaciones</h6>
                <p class="text-muted small mb-3">
                  Realiza un test para obtener recomendaciones personalizadas
                </p>
                <a routerLink="/test" class="btn btn-outline-primary btn-sm">
                  Comenzar Test
                </a>
              </div>

              <div *ngIf="getTopRecommendations().length > 0">
                <div *ngFor="let rec of getTopRecommendations(); let $last = last" class="recommendation-item mb-3">
                  <div class="d-flex align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="mb-1">{{ rec.name }}</h6>
                      <p class="text-muted small mb-2">
                        <i class="bi bi-geo-alt me-1"></i>
                        {{ rec.location }}, {{ rec.country }}
                      </p>
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="badge bg-primary">{{ rec.type }}</span>
                        <div class="match-score">
                          <span class="text-success fw-semibold">{{ rec.match_percentage }}%</span>
                          <small class="text-muted">match</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr *ngIf="!$last" class="my-3">
                </div>

                <div class="text-center mt-3">
                  <a routerLink="/universities" class="btn btn-outline-primary btn-sm">
                    Ver Todas las Universidades
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .stat-icon, .action-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .action-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-color: var(--bs-primary) !important;
    }

    .test-item:last-child {
      border-bottom: none !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }

    .recommendation-item:last-child hr {
      display: none;
    }

    .match-score {
      text-align: right;
    }

    .card {
      transition: all 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .container-fluid {
        padding: 1rem;
      }

      .stat-icon, .action-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }
    }
  `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null
  testHistory: TestResult[] = []
  totalUniversities = 0

  constructor(
    private authService: AuthService,
    private testService: TestService,
    private universityService: UniversityService,
  ) {}

  ngOnInit(): void {
    this.loadUserData()
    this.loadDashboardData()
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadTestHistory()
      }
    })
  }

  private loadDashboardData(): void {
    // Load universities count
    this.universityService.getUniversities({ limit: 1 }).subscribe({
      next: (response) => {
        this.totalUniversities = response.pagination.total
      },
      error: (error) => console.error("Error loading universities count:", error),
    })
  }

  private loadTestHistory(): void {
    if (this.currentUser) {
      this.testService.getUserTestHistory(this.currentUser.id).subscribe({
        next: (history) => {
          this.testHistory = history
        },
        error: (error) => console.error("Error loading test history:", error),
      })
    }
  }

  getRecommendationsCount(): number {
    return this.testHistory.reduce(
      (total, test) => total + (test.recommendations?.length || 0),
      0
    )
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

  getRecentTests(): TestResult[] {
    return this.testHistory.slice(0, 3)
  }

  getTopRecommendations(): any[] {
    const allRecommendations: any[] = []

    this.testHistory.forEach((test) => {
      (test.recommendations || []).forEach((rec) => {
        allRecommendations.push(rec)
      })
    })

    return allRecommendations
      .sort((a, b) => b.match_percentage - a.match_percentage)
      .slice(0, 3)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}
