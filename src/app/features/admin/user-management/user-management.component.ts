import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AdminService } from "../../../core/services/admin.service"
import { LoadingService } from "../../../core/services/loading.service"
import { User } from "../../../core/models/user.model"
import { debounceTime, distinctUntilChanged } from "rxjs/operators"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="display-6 fw-bold text-primary-custom mb-2">
                <i class="material-icons me-3">Usuarios</i>
                Gestión de Usuarios
              </h1>
              <p class="lead text-muted">
                Administra usuarios registrados en el sistema
              </p>
            </div>
            <div class="admin-actions">
              <button class="btn btn-outline-secondary me-2" (click)="exportUsers()">
                <i class="material-icons me-2"></i>
                Exportar
              </button>
              <button class="btn btn-primary" (click)="refreshUsers()">
                <i class="material-icons me-2"></i>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <form [formGroup]="filterForm" class="row g-3">
            <div class="col-md-4">
              <label for="search" class="form-label">
                <i class="material-icons me-1"></i>
                Buscar Usuario
              </label>
              <input
                type="text"
                id="search"
                class="form-control"
                formControlName="search"
                placeholder="Nombre o email..."
              >
            </div>
            <div class="col-md-3">
              <label for="role" class="form-label">
                <i class="material-icons me-1"></i>
                Rol
              </label>
              <select id="role" class="form-select" formControlName="role">
                <option value="">Todos los roles</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div class="col-md-3">
              <label for="sortBy" class="form-label">
                <i class="material-icons me-1">sort</i>
                Ordenar por
              </label>
              <select id="sortBy" class="form-select" formControlName="sortBy">
                <option value="created_at">Fecha de registro</option>
                <option value="name">Nombre</option>
                <option value="last_login">Último acceso</option>
                <option value="tests_count">Tests realizados</option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button type="button" class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                <i class="material-icons me-1">clear</i>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            Lista de Usuarios
            <span class="badge bg-primary ms-2" *ngIf="totalUsers > 0">{{ totalUsers }}</span>
          </h5>
          <div class="table-controls">
            <select class="form-select form-select-sm" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>
        </div>
        <div class="card-body p-0">
          <div *ngIf="!isLoading && users.length > 0" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Usuario</th>
                  <th>Información</th>
                  <th>Actividad</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-3">
                        <i class="material-icons"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ user.name }}</h6>
                        <small class="text-muted">{{ user.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="user-info">
                      <div *ngIf="user.age" class="info-item">
                        <i class="material-icons me-1"></i>
                        {{ user.age }} años
                      </div>
                      <div *ngIf="user.location" class="info-item">
                        <i class="material-icons me-1"></i>
                        {{ user.location }}
                      </div>
                      <div *ngIf="user.education_level" class="info-item">
                        <i class="material-icons me-1"></i>
                        {{ user.education_level }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="activity-info">
                      <div class="tests-count">
                        <span class="badge bg-primary">{{ user.tests_count || 0 }} tests</span>
                      </div>
                      <small class="text-muted d-block mt-1">
                        Registro: {{ formatDate(user.created_at) }}
                      </small>
                      <small class="text-muted d-block" *ngIf="user.last_login">
                        Último acceso: {{ formatDate(user.last_login) }}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="user.role === 'admin' ? 'bg-danger' : 'bg-secondary'"
                    >
                      {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge bg-success">Activo</span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        (click)="viewUser(user)"
                        title="Ver perfil"
                      >
                        <i class="material-icons">ver</i>
                      </button>
                      <button
                        class="btn btn-outline-info"
                        (click)="editUser(user)"
                        title="Editar usuario"
                      >
                        <i class="material-icons"></i>
                      </button>
                      <button
                        class="btn btn-outline-warning"
                        (click)="sendMessage(user)"
                        title="Enviar mensaje"
                      >
                        <i class="material-icons"></i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="deleteUser(user)"
                        title="Eliminar usuario"
                        [disabled]="user.role === 'admin'"
                      >
                        <i class="material-icons">Eliminar</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && users.length === 0" class="text-center py-5">
            <i class="material-icons text-muted mb-3" style="font-size: 64px;">Usuarios</i>
            <h5>No se encontraron usuarios</h5>
            <p class="text-muted">
              Intenta ajustar los filtros de búsqueda para encontrar más resultados
            </p>
            <button class="btn btn-primary" (click)="clearFilters()">
              <i class="material-icons me-2"></i>
              Limpiar Filtros
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Cargando usuarios...</span>
            </div>
            <h5>Cargando usuarios...</h5>
          </div>
        </div>

        <!-- Pagination -->
        <div class="card-footer" *ngIf="totalPages > 1">
          <nav aria-label="Paginación de usuarios">
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" [class.disabled]="currentPage === 1">
                <button class="page-link" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
                  <i class="material-icons">chevron_left</i>
                </button>
              </li>

              <li
                *ngFor="let page of getPageNumbers()"
                class="page-item"
                [class.active]="page === currentPage"
              >
                <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
              </li>

              <li class="page-item" [class.disabled]="currentPage === totalPages">
                <button class="page-link" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
                  <i class="material-icons">chevron_right</i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-4">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadUsers()">
          Reintentar
        </button>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div class="modal fade" id="userDetailModal" tabindex="-1" *ngIf="selectedUser">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="material-icons me-2">person</i>
              Detalles del Usuario
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Información Personal</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>{{ selectedUser.name }}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedUser.email }}</td>
                  </tr>
                  <tr>
                    <td><strong>Edad:</strong></td>
                    <td>{{ selectedUser.age || 'No especificada' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Ubicación:</strong></td>
                    <td>{{ selectedUser.location || 'No especificada' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Educación:</strong></td>
                    <td>{{ selectedUser.education_level || 'No especificada' }}</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Actividad en el Sistema</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Rol:</strong></td>
                    <td>
                      <span class="badge" [class]="selectedUser.role === 'admin' ? 'bg-danger' : 'bg-secondary'">
                        {{ selectedUser.role === 'admin' ? 'Administrador' : 'Usuario' }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Tests realizados:</strong></td>
                    <td>{{ selectedUser.tests_count || 0 }}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha de registro:</strong></td>
                    <td>{{ formatDate(selectedUser.created_at) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Último acceso:</strong></td>
                    <td>{{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nunca' }}</td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="row mt-3" *ngIf="selectedUser.interests">
              <div class="col-12">
                <h6>Intereses</h6>
                <p class="text-muted">{{ selectedUser.interests }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" (click)="editUser(selectedUser)">
              <i class="material-icons me-2">edit</i>
              Editar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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

    .user-info .info-item {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 2px;
    }

    .user-info .info-item i {
      font-size: 14px;
    }

    .activity-info {
      font-size: 0.85rem;
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
      background-color: #f8f9fa;
    }

    .table-hover tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    .btn-group-sm .btn {
      padding: 4px 8px;
    }

    .btn-group-sm .btn i {
      font-size: 16px;
    }

    .pagination .page-link {
      border-color: #e9ecef;
      color: #6c757d;
    }

    .pagination .page-item.active .page-link {
      background-color: #667eea;
      border-color: #667eea;
    }

    .pagination .page-link:hover {
      background-color: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    @media (max-width: 768px) {
      .admin-actions {
        margin-top: 15px;
      }

      .table-responsive {
        font-size: 14px;
      }

      .btn-group {
        flex-direction: column;
      }

      .user-info .info-item {
        font-size: 0.8rem;
      }
    }
  `,
  ],
})
export class UserManagementComponent implements OnInit {
  filterForm!: FormGroup
  users: User[] = []
  selectedUser: User | null = null
  currentPage = 1
  totalPages = 1
  totalUsers = 0
  pageSize = 25
  isLoading = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadUsers()
    this.setupFormSubscriptions()
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      search: [""],
      role: [""],
      sortBy: ["created_at"],
    })
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1
      this.loadUsers()
    })
  }

  loadUsers(): void {
    this.isLoading = true
    this.errorMessage = ""

    const filters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.pageSize,
    }

    // Remover valores vacíos
    Object.keys(filters).forEach((key) => {
      if (filters[key] === "") {
        delete filters[key]
      }
    })

    this.adminService.getUsers(filters).subscribe({
      next: (response) => {
        this.users = response.users
        this.totalPages = response.pagination.pages
        this.totalUsers = response.pagination.total
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.error || "Error cargando usuarios"
        console.error("Error loading users:", error)
      },
    })
  }

  refreshUsers(): void {
    this.loadUsers()
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: "",
      role: "",
      sortBy: "created_at",
    })
    this.currentPage = 1
  }

  onPageSizeChange(): void {
    this.currentPage = 1
    this.loadUsers()
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
      this.loadUsers()
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = []
    const maxPages = 5
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2))
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1)

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  viewUser(user: User): void {
    this.selectedUser = user
    // Abrir modal (requiere Bootstrap JS)
    const modal = new (window as any).bootstrap.Modal(document.getElementById("userDetailModal"))
    modal.show()
  }

  editUser(user: User): void {
    // Implementar edición de usuario
    console.log("Editar usuario:", user)
    // Aquí se podría abrir un modal de edición o navegar a una página de edición
  }

  sendMessage(user: User): void {
    // Implementar envío de mensaje
    console.log("Enviar mensaje a:", user)
    // Aquí se podría abrir un modal de composición de mensaje
  }

  deleteUser(user: User): void {
    if (user.role === "admin") {
      alert("No se puede eliminar un usuario administrador")
      return
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers()
          alert("Usuario eliminado exitosamente")
        },
        error: (error) => {
          console.error("Error deleting user:", error)
          alert("Error eliminando usuario: " + (error.error?.error || "Error desconocido"))
        },
      })
    }
  }

  exportUsers(): void {
    const exportData = {
      fecha_exportacion: new Date().toISOString(),
      total_usuarios: this.totalUsers,
      filtros_aplicados: this.filterForm.value,
      usuarios: this.users.map((user) => ({
        id: user.id,
        nombre: user.name,
        email: user.email,
        edad: user.age,
        ubicacion: user.location,
        nivel_educativo: user.education_level,
        rol: user.role,
        tests_realizados: user.tests_count || 0,
        fecha_registro: user.created_at,
        ultimo_acceso: user.last_login,
      })),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `usuarios_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  formatDate(dateString?: string): string {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
