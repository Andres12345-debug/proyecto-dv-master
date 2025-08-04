import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-info text-light py-5 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4">
            <h5 class="text-gradient-light mb-3">
              <i class="bi bi-mortarboard-fill me-2"></i>
              Vocare
            </h5>
            <p class="text-muted">
              Plataforma líder en descubrimiento vocacional que te ayuda a encontrar
              tu carrera ideal y las mejores universidades para tu futuro profesional.
            </p>
          </div>

          <div class="col-md-2 mb-4">
            <h6 class="mb-3">Navegación</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/dashboard" class="text-muted text-decoration-none">Inicio</a></li>
              <li><a routerLink="/test" class="text-muted text-decoration-none">Test Vocacional</a></li>
              <li><a routerLink="/universities" class="text-muted text-decoration-none">Universidades</a></li>
              <li><a routerLink="/profile" class="text-muted text-decoration-none">Mi Perfil</a></li>
            </ul>
          </div>

          <div class="col-md-3 mb-4">
            <h6 class="mb-3">Recursos</h6>
            <ul class="list-unstyled">
              <li><a href="#" class="text-muted text-decoration-none">Guía de Carreras</a></li>
              <li><a href="#" class="text-muted text-decoration-none">Blog Educativo</a></li>
              <li><a href="#" class="text-muted text-decoration-none">Preguntas Frecuentes</a></li>
              <li><a href="#" class="text-muted text-decoration-none">Soporte</a></li>
            </ul>
          </div>

          <div class="col-md-3 mb-4">
            <h6 class="mb-3">Contacto</h6>
            <ul class="list-unstyled text-muted">
              <li><i class="bi bi-envelope me-2"></i>info&#64;vocarediscovery.com</li>
              <li><i class="bi bi-telephone me-2"></i>+57 (320) 252-7095</li>
              <li><i class="bi bi-geo-alt me-2"></i> Tunja,Colombia</li>
            </ul>

            <div class="social-links mt-3">
              <a href="#" class="text-muted me-3"><i class="bi bi-facebook"></i></a>
              <a href="#" class="text-muted me-3"><i class="bi bi-twitter"></i></a>
              <a href="#" class="text-muted me-3"><i class="bi bi-linkedin"></i></a>
              <a href="#" class="text-muted"><i class="bi bi-instagram"></i></a>
            </div>
          </div>
        </div>

        <hr class="my-4">

        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="text-muted mb-0">
              © {{ currentYear }} Vocare Discovery. Todos los derechos reservados.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <a href="#" class="text-muted text-decoration-none me-3">Términos de Uso</a>
            <a href="#" class="text-muted text-decoration-none">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
    .text-gradient-light {
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .social-links a {
      font-size: 1.2rem;
      transition: color 0.2s ease-in-out;
    }

    .social-links a:hover {
      color: var(--bs-primary) !important;
    }

    footer a:hover {
      color: var(--bs-primary) !important;
    }
  `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear()
}
