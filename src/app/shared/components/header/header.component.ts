import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
      <div class="container">
        <a class="navbar-brand fw-bold text-gradient" routerLink="/dashboard">
          <i class="bi bi-mortarboard-fill me-1"></i>
          Vocare
        </a> 

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto" *ngIf="currentUser$ | async as user; else guestMenu">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-house me-1"></i>Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/test" routerLinkActive="active">
                <i class="bi bi-clipboard-check me-1"></i>Test Vocacional
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/universities" routerLinkActive="active">
                <i class="bi bi-building me-1"></i>Universidades
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/careers" routerLinkActive="active">
                <i class="bi bi-journal-bookmark me-1"></i>Carreras
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/userManual" routerLinkActive="active">
                <i class="bi bi-info-circle me-1"></i>Manual del Usuario
              </a>
            </li>
          </ul>

          <ng-template #guestMenu>
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/auth/login" routerLinkActive="active">
                  <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
                </a>
              </li>
            </ul>
          </ng-template>

          <div class="navbar-nav" *ngIf="currentUser$ | async as user">
            <div class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <div class="avatar me-2">
                  <i class="bi bi-person-circle"></i>
                </div>
                {{ user.name }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" routerLink="/profile">
                    <i class="bi bi-person me-2"></i>Mi Perfil
                  </a>
                </li>
                <li *ngIf="user.role === 'admin'">
                  <a class="dropdown-item" routerLink="/admin">
                    <i class="bi bi-gear me-2"></i>Administración
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" (click)="logout()">
                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.95) !important;
    }
    .navbar-brand { font-size: 1.5rem; }
    .nav-link { font-weight: 500; transition: color 0.2s ease-in-out; }
    .nav-link:hover { color: var(--bs-primary) !important; }
    .nav-link.active { color: var(--bs-primary) !important; font-weight: 600; }
    .avatar i { font-size: 1.5rem; color: var(--bs-primary); }
    .dropdown-item { transition: all 0.2s ease-in-out; }
    .dropdown-item:hover { background-color: var(--bs-primary); color: white; }
  `],
})
export class HeaderComponent {
  // ✅ Tipado explícito para evitar 'unknown' en el async pipe
  currentUser$: Observable<any | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
