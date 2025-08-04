import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-hero text-white text-center py-5">
      <div class="container">
        <h1 class="display-4 fw-bold">Descubre tu vocación y encuentra tu universidad ideal</h1>
       
        <p class="lead mt-3">
          Nuestra intención con esta página es apoyar a los estudiantes que aún no saben qué carrera elegir. 
          Queremos que sea una herramienta útil y sencilla que les ayude a conocerse mejor y encontrar opciones
          que se ajusten a sus intereses, habilidades y sueños.

        </p>
        
      </div>
    </div>

    <div class="container my-5">
      <div class="row text-center">
        <div class="col-md-4 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <i class="bi bi-clipboard-check fs-1 text-primary mb-3"></i>
              <h5 class="card-title">Test Vocacional</h5>
              <p class="card-text">
                Realiza un test personalizado para descubrir tus intereses, habilidades y posibles caminos profesionales.
              </p>
              <a routerLink="/auth/login" class="btn btn-outline-primary btn-sm">Realizar Test</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <i class="bi bi-building fs-1 text-success mb-3"></i>
              <h5 class="card-title">Explorar Universidades</h5>
              <p class="card-text">
                Accede a un catálogo de universidades adaptadas a tus intereses y ubicación.
              </p>
              <a routerLink="/auth/login" class="btn btn-outline-success btn-sm">Ver Universidades</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <i class="bi bi-person-lines-fill fs-1 text-info mb-3"></i>
              <h5 class="card-title">Gestión de Perfil</h5>
              <p class="card-text">
                Personaliza tu perfil para recibir mejores recomendaciones y mantener tu progreso.
              </p>
              <a routerLink="/auth/login" class="btn btn-outline-info btn-sm">Ir al Perfil</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-4">¿Cómo funciona?</h2>
        <div class="row justify-content-center">
          <div class="col-md-3 mb-4">
            <div class="step-icon bg-primary text-white mb-3">
              <i class="bi bi-question-circle fs-3"></i>
            </div>
            <p><strong>1. Realiza el test</strong><br>Evalúa tus intereses y habilidades.</p>
          </div>
          <div class="col-md-3 mb-4">
            <div class="step-icon bg-warning text-white mb-3">
              <i class="bi bi-bar-chart-line fs-3"></i>
            </div>
            <p><strong>2. Revisa tus resultados</strong><br>Conoce tus aptitudes destacadas.</p>
          </div>
          <div class="col-md-3 mb-4">
            <div class="step-icon bg-success text-white mb-3">
              <i class="bi bi-mortarboard fs-3"></i>
            </div>
            <p><strong>3. Explora universidades</strong><br>Encuentra opciones compatibles con tu perfil.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center py-5 bg-gradient-primary text-white">
      <h3 class="mb-4">¿Listo para comenzar tu camino universitario?</h3>
      <a routerLink="/auth/login" class="btn btn-lg btn-light text-primary">Iniciar Test Vocacional</a>
    </div>
  `,
  styles: [`
  
    .home-hero {
      background: linear-gradient(135deg, #6f42c1 0%, #1cc88a 100%);
    }

    .step-icon {
      width: 70px;
      height: 70px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .bg-gradient-primary {
      background: linear-gradient(135deg, #4e73df 0%, #1cc88a 100%);
    }

    .card:hover {
      transform: translateY(-5px);
      transition: all 0.2s ease-in-out;
    }
  `]
})
export class HomeComponent {}
