import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AdminService } from "../../../core/services/admin.service"
import { LoadingService } from "../../../core/services/loading.service"

interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalTests: number
  testsToday: number
  totalUniversities: number
  activeQuestions: number
  activeUsers: any[]
  testsPerDay: any[]
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="display-6 fw-bold text-primary-custom mb-2">
                <i class="material-icons me-3"></i>
                Panel de Administración
              </h1>
              <p class="lead text-muted">
                Gestiona usuarios, universidades y contenido del sistema
              </p>
            </div>
            <div class="admin-actions">
              <button class="btn btn-outline-primary me-2" (click)="refreshData()">
                <i class="material-icons me-2"></i>
                Actualizar
              </button>
              <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="material-icons me-2"></i>
                  Crear Nuevo
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/admin/universities">
                    <i class="material-icons me-2"></i>
                    Universidad
                  </a></li>
                  <li><a class="dropdown-item" routerLink="/admin/questions">
                    <i class="material-icons me-2"></i>
                    Pregunta
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4" *ngIf="stats">
        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-primary text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">people</i>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalUsers }}</h3>
                <p class="mb-0">Total Usuarios</p>
                <small class="opacity-75">+{{ stats.newUsersToday }} hoy</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-success text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">quiz</i>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalTests }}</h3>
                <p class="mb-0">Tests Realizados</p>
                <small class="opacity-75">+{{ stats.testsToday }} hoy</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-info text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">school</i>
              </div>
              <div class="stat-details">
                <h3>{{ stats.totalUniversities }}</h3>
                <p class="mb-0">Universidades</p>
                <small class="opacity-75">Activas</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-warning text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">help_outline</i>
              </div>
              <div class="stat-details">
                <h3>{{ stats.activeQuestions }}</h3>
                <p class="mb-0">Preguntas</p>
                <small class="opacity-75">Activas</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-secondary text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">trending_up</i>
              </div>
              <div class="stat-details">
                <h3>{{ getActiveUsersCount() }}</h3>
                <p class="mb-0">Usuarios Activos</p>
                <small class="opacity-75">Últimos 30 días</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
          <div class="stat-card bg-dark text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons">analytics</i>
              </div>
              <div class="stat-details">
                <h3>{{ getAverageTestsPerDay() }}</h3>
                <p class="mb-0">Promedio Diario</p>
                <small class="opacity-75">Tests por día</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Tables Row -->
      <div class="row">
        <!-- Tests Chart -->
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2">show_chart</i>
                Tests Realizados (Últimos 7 días)
              </h5>
            </div>
            <div class="card-body">
              <div class="chart-container" *ngIf="stats && stats.testsPerDay && stats.testsPerDay.length > 0">
                <canvas #testsChart width="400" height="200"></canvas>
              </div>
              <div *ngIf="!stats || !stats.testsPerDay || stats.testsPerDay.length === 0" class="text-center py-4">
                <i class="material-icons text-muted mb-3" style="font-size: 48px;">show_chart</i>
                <p class="text-muted">No hay datos suficientes para mostrar el gráfico</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="material-icons me-2">flash_on</i>
                Acciones Rápidas
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-3">
                <a routerLink="/admin/users" class="btn btn-outline-primary">
                  <i class="material-icons me-2">people</i>
                  Gestionar Usuarios
                </a>
                <a routerLink="/admin/universities" class="btn btn-outline-success">
                  <i class="material-icons me-2">school</i>
                  Gestionar Universidades
                </a>
                <a routerLink="/admin/questions" class="btn btn-outline-info">
                  <i class="material-icons me-2">quiz</i>
                  Gestionar Preguntas
                </a>
                <button class="btn btn-outline-warning" (click)="exportData()">
                  <i class="material-icons me-2">download</i>
                  Exportar Datos
                </button>
                <button class="btn btn-outline-secondary" (click)="viewLogs()">
                  <i class="material-icons me-2">description</i>
                  Ver Logs del Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Users Table -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="material-icons me-2">people</i>
                Usuarios Más Activos (Últimos 30 días)
              </h5>
              <a routerLink="/admin/users" class="btn btn-sm btn-outline-primary">
                Ver Todos
              </a>
            </div>
            <div class="card-body">
              <div *ngIf="!stats || !stats.activeUsers || stats.activeUsers.length === 0" class="text-center py-4">
                <i class="material-icons text-muted mb-3" style="font-size: 48px;">people</i>
                <p class="text-muted">No hay usuarios activos en los últimos 30 días</p>
              </div>

              <div *ngIf="stats && stats.activeUsers && stats.activeUsers.length > 0" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Tests Realizados</th>
                      <th>Actividad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of getActiveUsers().slice(0, 10)">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="user-avatar me-3">
                            <i class="material-icons">person</i>
                          </div>
                          <strong>{{ user.name }}</strong>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge bg-primary">{{ user.tests_count }}</span>
                      </td>
                      <td>
                        <div class="activity-indicator">
                          <div class="progress" style="height: 4px; width: 60px;">
                            <div
                              class="progress-bar bg-success"
                              [style.width.%]="getActivityPercentage(user.tests_count)"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" title="Ver perfil">
                            <i class="material-icons">visibility</i>
                          </button>
                          <button class="btn btn-outline-info" title="Enviar mensaje">
                            <i class="material-icons">mail</i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando estadísticas...</span>
        </div>
        <h5>Cargando panel de administración...</h5>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadDashboardData()">
          Reintentar
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .stat-card {
      border-radius: 15px;
      padding: 20px;
      transition: all 0.3s ease;
      height: 100%;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
    }

    .stat-icon {
      font-size: 48px;
      margin-right: 15px;
      opacity: 0.8;
    }

    .stat-icon i {
      font-size: 48px;
    }

    .stat-details h3 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-details p {
      font-size: 0.9rem;
      margin-bottom: 2px;
    }

    .stat-details small {
      font-size: 0.8rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .activity-indicator {
      display: flex;
      align-items: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }

    .admin-actions .dropdown-menu {
      border: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }

    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    @media (max-width: 768px) {
      .stat-card {
        margin-bottom: 15px;
      }

      .stat-content {
        flex-direction: column;
        text-align: center;
      }

      .stat-icon {
        margin-right: 0;
        margin-bottom: 10px;
      }

      .admin-actions {
        margin-top: 15px;
      }
    }
  `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null
  isLoading = false
  errorMessage = ""

  constructor(
    private adminService: AdminService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.isLoading = true
    this.errorMessage = ""

    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats
        this.isLoading = false
        // Renderizar gráfico después de cargar datos
        setTimeout(() => this.renderChart(), 100)
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.error || "Error cargando estadísticas del dashboard"
        console.error("Error loading dashboard:", error)
      },
    })
  }

  refreshData(): void {
    this.loadDashboardData()
  }

  getActiveUsersCount(): number {
    return this.stats?.activeUsers?.filter((user) => user.tests_count && user.tests_count > 0).length || 0
  }

  getAverageTestsPerDay(): number {
    if (!this.stats?.testsPerDay?.length) return 0
    const total = this.stats.testsPerDay.reduce((sum, day) => sum + day.count, 0)
    return Math.round(total / this.stats.testsPerDay.length)
  }

  getActivityPercentage(testsCount: number): number {
    if (!this.stats?.activeUsers?.length) return 0
    const maxTests = Math.max(...this.stats.activeUsers.map((u) => u.tests_count || 0))
    return maxTests > 0 ? (testsCount / maxTests) * 100 : 0
  }

  private renderChart(): void {
    // Implementación básica del gráfico (se puede mejorar con Chart.js)
    if (!this.stats?.testsPerDay.length) return

    // Aquí se podría integrar Chart.js para gráficos más avanzados
    console.log("Datos para gráfico:", this.stats.testsPerDay)
  }

  exportData(): void {
    if (!this.stats) return

    const exportData = {
      fecha_exportacion: new Date().toISOString(),
      estadisticas: this.stats,
      resumen: {
        total_usuarios: this.stats.totalUsers,
        total_tests: this.stats.totalTests,
        total_universidades: this.stats.totalUniversities,
        usuarios_activos: this.getActiveUsersCount(),
        promedio_tests_diario: this.getAverageTestsPerDay(),
      },
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `estadisticas_admin_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  viewLogs(): void {
    // Implementar modal o navegación a logs
    console.log("Ver logs del sistema")
    // Aquí se podría abrir un modal con los logs o navegar a una página de logs
  }

  getActiveUsers(): any[] {
    return this.stats?.activeUsers || []
  }
}
