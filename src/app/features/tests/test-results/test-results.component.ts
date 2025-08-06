import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterModule } from "@angular/router"
import { TestService } from "../../../core/services/test.service"
import { LoadingService } from "../../../core/services/loading.service"
import { TestResult } from "../../../core/models/test.model"

@Component({
  selector: "app-test-results",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <!-- Success Header -->
          <div class="text-center mb-5" *ngIf="testResult">
            <div class="success-icon mb-4">
              <i class="material-icons">psychology</i>
            </div>
            <h1 class="display-5 fw-bold text-primary-custom mb-3">
              ¡Test Completado!
            </h1>
            <p class="lead text-muted">
              Hemos analizado tus respuestas y aquí están tus resultados personalizados
            </p>
          </div>

          <!-- Aptitudes Results -->
          <div class="card shadow-lg border-0 mb-5" *ngIf="testResult">
            <div class="card-header bg-gradient-primary text-white">
              <h3 class="mb-0">
                <i class="material-icons me-2">trending_up</i>
                Tus Aptitudes Principales
              </h3>
            </div>
            <div class="card-body p-4">
              <p class="text-muted mb-4">
                Basado en tus respuestas, estas son las áreas donde muestras mayor afinidad:
              </p>

              <div class="row" *ngIf="testResult && testResult.aptitudes.length > 0">
                <div
                  *ngFor="let aptitude of testResult.aptitudes.slice(0, 6); let i = index"
                  class="col-md-6 mb-4"
                >
                  <div class="aptitude-card h-100">
                    <div class="d-flex align-items-center mb-3">
                      <div class="aptitude-rank">{{ i + 1 }}</div>
                      <div class="flex-grow-1">
                        <h5 class="mb-1">{{ aptitude.name }}</h5>
                        <small class="text-muted">{{ aptitude.description }}</small>
                      </div>
                    </div>
                    <div class="progress mb-2" style="height: 8px;">
                      <div
                        class="progress-bar"
                        [class]="getProgressBarClass(i)"
                        role="progressbar"
                        [style.width.%]="getAptitudePercentage(aptitude.score!)"
                        [attr.aria-valuenow]="getAptitudePercentage(aptitude.score!)"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <div class="d-flex justify-content-between">
                      <small class="text-muted">Afinidad</small>
                      <small class="fw-bold">{{ getAptitudePercentage(aptitude.score!) }}%</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- University Recommendations -->
          <div class="card shadow-lg border-0 mb-5" *ngIf="testResult && testResult.recommendations.length > 0">
            <div class="card-header bg-gradient-success text-white">
              <h3 class="mb-0">
                <i class="material-icons me-2">school</i>
                Universidades Recomendadas
              </h3>
            </div>
            <div class="card-body p-4">
              <p class="text-muted mb-4">
                Estas universidades se alinean mejor con tu perfil vocacional:
              </p>

              <div class="row">
                <div
                  *ngFor="let university of testResult.recommendations.slice(0, 6)"
                  class="col-lg-6 mb-4"
                >
                  <div class="university-card h-100">
                    <div class="university-header">
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="university-name mb-0">{{ university.name }}</h5>
                        <div class="match-badge">
                          {{ university.match_percentage }}% match
                        </div>
                      </div>
                      <div class="university-location">
                        <i class="material-icons me-1">location_on</i>
                        {{ university.location }}, {{ university.country }}
                      </div>
                    </div>

                    <div class="university-details mt-3">
                      <div class="d-flex gap-2 mb-3">
                        <span class="badge bg-primary">{{ university.type }}</span>
                        <span class="badge bg-secondary">{{ university.modality }}</span>
                      </div>

                      <div class="d-flex justify-content-between align-items-center">
                        <div class="rating">
                          <i class="material-icons text-warning me-1">star</i>
                          <span>{{ university.rating }}</span>
                        </div>
                        <button class="btn btn-outline-primary btn-sm" routerLink="/universities">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Career Recommendations -->
          <div class="card shadow-lg border-0 mb-5" *ngIf="(testResult?.careers?.length ?? 0) > 0">
            <div class="card-header bg-gradient-info text-white">
              <h3 class="mb-0">
                <i class="material-icons me-2">work</i>
                Carreras Recomendadas
              </h3>
            </div>
            <div class="card-body p-4">
              <p class="text-muted mb-4">
                Estas carreras se alinean mejor con tus aptitudes principales:
              </p>
              <div class="row">
                <div
                  *ngFor="let career of testResult?.careers?.slice(0, 6)"
                  class="col-lg-6 mb-4"
                >
                  <div class="career-card h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h5 class="career-name mb-0">{{ career.name }}</h5>
                      <div class="match-badge">
                        {{ career.match_percentage }}% match
                      </div>
                    </div>
                    <div class="career-details mt-2">
                      <span class="badge bg-info">{{ career.duration_years }} años</span>
                      <p class="text-muted mt-2">{{ career.description }}</p>
                    </div>
                    <button class="btn btn-outline-primary btn-sm mt-2" [routerLink]="['/careers', career.id]">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="text-center">
            <div class="d-flex flex-wrap gap-3 justify-content-center">
              <a routerLink="/universities" class="btn btn-primary btn-lg">
                <i class="material-icons me-2">explore</i>
                Explorar Universidades
              </a>
              <a routerLink="/test" class="btn btn-outline-secondary btn-lg">
                <i class="material-icons me-2">refresh</i>
                Repetir Test
              </a>
              <a routerLink="/profile" class="btn btn-outline-info btn-lg">
                <i class="material-icons me-2">person</i>
                Ver Mi Perfil
              </a>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="!testResult && !errorMessage" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Cargando resultados...</span>
            </div>
            <h5>Cargando tus resultados...</h5>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage && !testResult" class="alert alert-danger">
            <i class="material-icons me-2">error</i>
            {{ errorMessage }}
            <div class="mt-3">
              <a routerLink="/test" class="btn btn-primary">
                Realizar Nuevo Test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .bg-gradient-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .bg-gradient-success {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
    }

    .success-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      animation: pulse 2s infinite;
    }

    .success-icon i {
      font-size: 60px;
      color: white;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .aptitude-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 15px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .aptitude-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .aptitude-rank {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
    }

    .progress-bar {
      transition: width 1s ease-in-out;
    }

    .progress-bar.bg-primary { background: linear-gradient(90deg, #667eea, #764ba2) !important; }
    .progress-bar.bg-success { background: linear-gradient(90deg, #56ab2f, #a8e6cf) !important; }
    .progress-bar.bg-info { background: linear-gradient(90deg, #3498db, #85c1e9) !important; }
    .progress-bar.bg-warning { background: linear-gradient(90deg, #f39c12, #f7dc6f) !important; }
    .progress-bar.bg-secondary { background: linear-gradient(90deg, #6c757d, #adb5bd) !important; }
    .progress-bar.bg-dark { background: linear-gradient(90deg, #343a40, #6c757d) !important; }

    .university-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s ease;
    }

    .university-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }

    .university-name {
      color: #333;
      font-weight: 600;
      line-height: 1.3;
    }

    .match-badge {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .university-location {
      color: #6c757d;
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    .university-location i {
      font-size: 16px;
    }

    .rating {
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    @media (max-width: 768px) {
      .aptitude-card, .university-card {
        padding: 15px;
      }

      .success-icon {
        width: 80px;
        height: 80px;
      }

      .success-icon i {
        font-size: 40px;
      }

      .d-flex.gap-3 {
        flex-direction: column;
        align-items: center;
      }

      .btn-lg {
        width: 100%;
        max-width: 300px;
      }
    }
  `,
  ],
})
export class TestResultsComponent implements OnInit {
  testResult: TestResult | null = null;
  errorMessage = "";

  constructor(
    private route: ActivatedRoute,
    private testService: TestService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    console.log("ngOnInit ejecutado");
    this.errorMessage = "";
    this.testResult = null;
    const testId = this.route.snapshot.paramMap.get("testId");
    console.log("Valor de testId:", testId);
    if (testId && !isNaN(Number(testId))) {
      this.loadTestResults(Number(testId));
    } else {
      this.testResult = null;
      this.errorMessage = "ID de test inválido";
    }
  }

  private loadTestResults(testId: number): void {
    console.log("Cargando resultados para testId:", testId);
    this.errorMessage = ""
    this.loadingService.show()
    this.testService.getTestResults(testId).subscribe({
      next: (result) => {
        console.log("Respuesta recibida en resultados:", result)
        if (result && (result.id || result.testId)) {
          this.testResult = {
            ...result,
            aptitudes: Array.isArray(result.aptitudes) ? result.aptitudes : [],
            recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
          }
          console.log("Valor asignado a testResult:", this.testResult)
          this.errorMessage = ""
        } else {
          this.testResult = null
          this.errorMessage = "No se pudo cargar el resultado del test."
        }
        this.loadingService.hide()
      },
      error: (error) => {
        this.loadingService.hide()
        this.testResult = null
        this.errorMessage = error.message || error.error?.error || "Error cargando los resultados del test"
        console.error("Error loading test results:", error)
        alert("Error loading test results: " + JSON.stringify(error))
      },
    })
  }

  getTotalScore(): number {
  return this.testResult?.aptitudes.reduce((acc, apt) => acc + apt.score, 0) || 1
}

getAptitudePercentage(score: number | string): number {
  const numScore = typeof score === "string" ? parseFloat(score) : score
  const totalScore = this.getTotalScore()
  return Math.round((numScore / totalScore) * 100)
}


  getProgressBarClass(index: number): string {
    const classes = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-secondary", "bg-dark"]
    return classes[index % classes.length]
  }
}
