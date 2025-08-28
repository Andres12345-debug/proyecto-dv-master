import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-test-start",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center mb-5">
            <div class="test-icon mb-4">
           <i class="bi bi-clipboard-check-fill text-primary"></i>
            </div>
            <h1 class="display-5 fw-bold mb-3">Test de Orientación Vocacional</h1>
            <p class="lead text-muted">
              Descubre tus aptitudes y encuentra la carrera que mejor se adapte a tu perfil
            </p>
          </div>

          <div class="card border-0 shadow-custom">
            <div class="card-body p-5">
              <h3 class="card-title mb-4">¿Cómo funciona el test?</h3>
              
              <div class="row mb-4">
                <div class="col-md-4 text-center mb-4">
                  <div class="step-icon bg-primary text-white rounded-circle mx-auto mb-3">
                    <span class="fw-bold">1</span>
                  </div>
                  <h5 class="h6 fw-semibold">Responde las preguntas</h5>
                  <p class="text-muted small">
                    Contesta honestamente a {{ totalQuestions }} preguntas sobre tus intereses y habilidades
                  </p>
                </div>
                
                <div class="col-md-4 text-center mb-4">
                  <div class="step-icon bg-success text-white rounded-circle mx-auto mb-3">
                    <span class="fw-bold">2</span>
                  </div>
                  <h5 class="h6 fw-semibold">Análisis de resultados</h5>
                  <p class="text-muted small">
                    Nuestro algoritmo analiza tus respuestas para identificar tus aptitudes principales
                  </p>
                </div>
                
                <div class="col-md-4 text-center mb-4">
                  <div class="step-icon bg-info text-white rounded-circle mx-auto mb-3">
                    <span class="fw-bold">3</span>
                  </div>
                  <h5 class="h6 fw-semibold">Recomendaciones</h5>
                  <p class="text-muted small">
                    Recibe recomendaciones personalizadas de carreras y universidades
                  </p>
                </div>
              </div>

              <div class="alert alert-info border-0">
                <div class="d-flex">
                  <i class="bi bi-info-circle-fill me-3 mt-1"></i>
                  <div>
                    <h6 class="alert-heading">Información importante:</h6>
                    <ul class="mb-0 small">
                      <li>El test toma aproximadamente 15-20 minutos</li>
                      <li>No hay respuestas correctas o incorrectas</li>
                      <li>Responde de manera honesta y espontánea</li>
                      <li>Puedes pausar y continuar más tarde</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="text-center mt-4">
                <a routerLink="/test/questions" class="btn btn-primary btn-lg px-5">
                  <i class="bi bi-play-fill me-2"></i>
                  Comenzar Test
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .test-icon i {
      font-size: 5rem;
    }

    .step-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .btn-lg {
      padding: 0.75rem 2rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-lg:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }

    .card {
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  ],
})
export class TestStartComponent {
  totalQuestions = 30 // This would come from the API
}
