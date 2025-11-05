import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms"
import { CareerService } from "../../../core/services/career.service"
import { TestService } from "../../../core/services/test.service"
import { Career } from "../../../core/models/career.model"

@Component({
  selector: "app-career-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container py-4">
      <div class="page-header d-flex justify-content-between align-items-center">
        <div>
          <h1 class="display-6 fw-bold text-primary-custom mb-2">
            <i class="material-icons me-3"></i>
            Explorar Tus Carreras
          </h1>
          <p class="lead text-muted">
            Encuentra la carrera perfecta para tu futuro académico y profesional.
          </p>
        </div>

        <!-- Solo admin -->
        <div *ngIf="isAdmin">
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="material-icons me-2">add</i> Nueva Carrera
          </button>
        </div>
      </div>

      <!-- 🔎 Buscador -->
      <div class="row g-2 mb-4">
        <div class="col-sm-8 col-md-6">
          <input
            class="form-control"
            type="text"
            placeholder="Buscar por nombre (p. ej. Ingeniería)"
            [(ngModel)]="search"
            name="search"
          />
        </div>
      </div>

      <div class="row">
        <div *ngFor="let career of filteredCareers" class="col-md-6 mb-4">
          <div class="card career-card shadow-sm">
            <div class="card-body">
              <h5 class="card-title fw-semibold text-primary">{{ career.name }}</h5>
              <p class="card-text text-muted">{{ career.description }}</p>
              <div>
                <span class="badge bg-info">{{ career.duration_years }} años</span>
              </div>
              <div class="mt-3 d-flex gap-2">
                <a [routerLink]="['/careers', career.id]" class="btn btn-outline-primary">Ver Detalle</a>
                <!-- Acciones admin -->
                <button *ngIf="isAdmin" class="btn btn-outline-secondary" (click)="openEdit(career)">
                  <i class="material-icons me-1">edit</i>
                </button>
                <button *ngIf="isAdmin" class="btn btn-outline-danger" (click)="confirmDelete(career)">
                  <i class="material-icons me-1">delete</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal CRUD -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()"></div>
      <div class="modal d-block" tabindex="-1" *ngIf="showModal">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="material-icons me-2">{{ editing ? 'edit' : 'add' }}</i>
                {{ editing ? 'Editar Carrera' : 'Nueva Carrera' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>

            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Nombre</label>
                  <input class="form-control" formControlName="name" />
                  <div class="text-danger small" *ngIf="form.controls['name'].invalid && form.controls['name'].touched">
                    Nombre requerido (2-150)
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Duración (años)</label>
                  <input type="number" min="1" max="20" class="form-control" formControlName="duration_years" />
                </div>

                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea rows="4" class="form-control" formControlName="description"></textarea>
                </div>

                <div *ngIf="error" class="alert alert-danger">
                  <i class="material-icons me-2">error</i>{{ error }}
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving">
                  <span *ngIf="!saving">{{ editing ? 'Guardar' : 'Crear' }}</span>
                  <span *ngIf="saving">
                    <span class="spinner-border spinner-border-sm me-2"></span> Guardando...
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .career-card {
      border-radius: 12px;
      transition: all 0.25s ease-in-out;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      background-color: #ffffff;
    }
    .career-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      border-color: #0d6efd;
      background-color: #f8f9fa;
    }
    .career-card .card-title { transition: color 0.25s ease; }
    .career-card:hover .card-title { color: #0d6efd; }
    .btn-outline-primary { transition: all 0.25s ease; }
    .career-card:hover .btn-outline-primary {
      background-color: #0d6efd; color: #fff; border-color: #0d6efd;
    }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 1040; }
    .modal { z-index: 1050; }
  `],
})
export class CareerListComponent implements OnInit {
  careers: Career[] = []
  search = ""
  isAdmin = false
  showModal = false
  editing = false
  saving = false
  currentId: number | null = null
  error = ""
  form!: FormGroup

  constructor(
    private careerService: CareerService,
    private testService: TestService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      duration_years: [null as number | null],
      description: ["" as string | null],
    })

    this.detectAdmin()
    this.loadCareers()
  }

  loadCareers(): void {
    this.careers = []
    this.careerService.getAllCareers().subscribe({
      next: (data) => {
        this.careers = [...this.careers, ...data]
        this.testService.getAllCareers().subscribe({
          next: (data2) => {
            const nuevas: Career[] = (data2 ?? []).map(c => ({
              id: c.id,
              name: c.name,
              description: c.description ?? "",
              duration_years: c.duration_years ?? 0,
              aptitudes: c.aptitudes ?? [],
            }))
            const sinDuplicados = nuevas.filter(t => !this.careers.some(c => c.id === t.id))
            this.careers = [...this.careers, ...sinDuplicados]
          },
          error: (err) => console.error("Error al listar todas las carreras:", err),
        })
      },
      error: (err) => console.error("Error al cargar carreras:", err),
    })
  }

  get filteredCareers(): Career[] {
    const q = this.normalize(this.search)
    if (!q) return this.careers
    return this.careers.filter(c => this.normalize(c.name).includes(q))
  }

  private normalize(s: string): string {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }

  // ===== ADMIN CRUD =====
  openCreate(): void {
    this.editing = false
    this.currentId = null
    this.error = ""
    this.form.reset({ name: "", duration_years: null, description: "" })
    this.showModal = true
  }

  openEdit(c: Career): void {
    this.editing = true
    this.currentId = c.id
    this.error = ""
    this.form.setValue({
      name: c.name || "",
      duration_years: c.duration_years ?? null,
      description: c.description ?? "",
    })
    this.showModal = true
  }

  closeModal(): void {
    if (this.saving) return
    this.showModal = false
  }

  save(): void {
    if (this.form.invalid) return
    this.saving = true
    const payload = this.form.value
    const req = this.editing && this.currentId
      ? this.careerService.update(this.currentId, payload)
      : this.careerService.create(payload)

    req.subscribe({
      next: () => {
        this.saving = false
        this.showModal = false
        this.loadCareers()
      },
      error: (err) => {
        this.saving = false
        this.error = err?.error?.message || "Error guardando la carrera"
        console.error("save career error", err)
      },
    })
  }

  confirmDelete(c: Career): void {
    if (!confirm(`¿Eliminar la carrera "${c.name}"?`)) return
    this.careerService.remove(c.id).subscribe({
      next: () => this.loadCareers(),
      error: (err) => {
        alert(err?.error?.message || "Error eliminando la carrera")
        console.error("delete career error", err)
      },
    })
  }

  private detectAdmin(): void {
    try {
      const raw = localStorage.getItem("user")
      const user = raw ? JSON.parse(raw) : null
      this.isAdmin = user?.role === "admin"
    } catch {
      this.isAdmin = false
    }
  }
}
