import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="error-code mb-4">
          <h1 class="display-1 fw-bold text-gradient">404</h1>
        </div>

        <div class="error-message mb-4">
          <h2 class="h3 mb-3">¡Oops! Página no encontrada</h2>
          <p class="text-muted lead">
            La página que estás buscando no existe o ha sido movida.
          </p>
        </div>

        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary btn-lg me-3">
            <i class="bi bi-house me-2"></i>
            Ir al Dashboard
          </a>
          <button class="btn btn-outline-secondary btn-lg" onclick="history.back()">
            <i class="bi bi-arrow-left me-2"></i>
            Volver Atrás
          </button>
        </div>

        <div class="mt-5">
          <i class="bi bi-emoji-frown text-muted" style="font-size: 4rem;"></i>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .error-code {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    .btn {
      transition: all 0.3s ease-in-out;
    }

    .btn:hover {
      transform: translateY(-2px);
    }
  `,
  ],
})
export class NotFoundComponent {}
