import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { AdminService } from "../../../core/services/admin.service"
import { LoadingService } from "../../../core/services/loading.service"

interface Question {
  id: number
  text: string
  question_order: number
  active: boolean
  options: QuestionOption[]
  created_at: string
}

interface QuestionOption {
  id: number
  text: string
  aptitude_id: number
  aptitude_name: string
  weight: number
}

interface Aptitude {
  id: number
  name: string
  description: string
}

@Component({
  selector: "app-question-management",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="display-6 fw-bold text-primary-custom mb-2">
                <i class="material-icons me-3">quiz</i>
                Gestión de Preguntas
              </h1>
              <p class="lead text-muted">
                Administra las preguntas del test vocacional
              </p>
            </div>
            <div class="admin-actions">
              <button class="btn btn-outline-secondary me-2" (click)="exportQuestions()">
                <i class="material-icons me-2"></i>
                Exportar
              </button>
              <button class="btn btn-success" (click)="openCreateModal()">
                <i class="material-icons me-2"></i>
                Nueva Pregunta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-primary text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons"></i>
              </div>
              <div class="stat-details">
                <h3>{{ questions.length }}</h3>
                <p class="mb-0">Total Preguntas</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-success text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons"></i>
              </div>
              <div class="stat-details">
                <h3>{{ getActiveQuestionsCount() }}</h3>
                <p class="mb-0">Activas</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-info text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons"></i>
              </div>
              <div class="stat-details">
                <h3>{{ aptitudes.length }}</h3>
                <p class="mb-0">Aptitudes</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card bg-warning text-white">
            <div class="stat-content">
              <div class="stat-icon">
                <i class="material-icons"></i>
              </div>
              <div class="stat-details">
                <h3>{{ getTotalOptionsCount() }}</h3>
                <p class="mb-0">Total Opciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="card shadow-sm">
        <div class="card-header">
          <h5 class="mb-0">Lista de Preguntas</h5>
        </div>
        <div class="card-body p-0">
          <div *ngIf="!isLoading && questions.length > 0" class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Orden</th>
                  <th>Pregunta</th>
                  <th>Opciones</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let question of questions">
                  <td>
                    <span class="badge bg-secondary">{{ question.question_order }}</span>
                  </td>
                  <td>
                    <div class="question-text">
                      <h6 class="mb-1">{{ truncateText(question.text, 80) }}</h6>
                      <small class="text-muted">ID: {{ question.id }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="options-summary">
                      <span class="badge bg-primary">{{ question.options.length }} opciones</span>
                      <div class="mt-1">
                        <small
                          *ngFor="let option of question.options.slice(0, 2)"
                          class="badge bg-light text-dark me-1"
                        >
                          {{ option.aptitude_name }}
                        </small>
                        <small *ngIf="question.options.length > 2" class="text-muted">
                          +{{ question.options.length - 2 }} más
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class]="question.active ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ question.active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(question.created_at) }}</small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        class="btn btn-outline-primary"
                        (click)="viewQuestion(question)"
                        title="Ver detalles"
                      >
                        <i class="material-icons">visibility</i>
                      </button>
                      <button
                        class="btn btn-outline-info"
                        (click)="editQuestion(question)"
                        title="Editar"
                      >
                        <i class="material-icons">edit</i>
                      </button>
                      <button
                        class="btn btn-outline-warning"
                        (click)="toggleQuestionStatus(question)"
                        [title]="question.active ? 'Desactivar' : 'Activar'"
                      >
                        <i class="material-icons">
                          {{ question.active ? 'visibility_off' : 'visibility' }}
                        </i>
                      </button>
                      <button
                        class="btn btn-outline-danger"
                        (click)="deleteQuestion(question)"
                        title="Eliminar"
                      >
                        <i class="material-icons">eliminar</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && questions.length === 0" class="text-center py-5">
            <i class="material-icons text-muted mb-3" style="font-size: 64px;">Test</i>
            <h5>No hay preguntas registradas</h5>
            <p class="text-muted">Comienza agregando la primera pregunta del test vocacional</p>
            <button class="btn btn-primary" (click)="openCreateModal()">
              <i class="material-icons me-2"></i>
              Agregar Pregunta
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Cargando preguntas...</span>
            </div>
            <h5>Cargando preguntas...</h5>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="alert alert-danger mt-4">
        <i class="material-icons me-2">error</i>
        {{ errorMessage }}
        <button class="btn btn-sm btn-outline-danger ms-3" (click)="loadQuestions()">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="questionModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="material-icons me-2"></i>
              {{ isEditMode ? 'Editar Pregunta' : 'Nueva Pregunta' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="questionForm" (ngSubmit)="saveQuestion()">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-8 mb-3">
                  <label for="text" class="form-label">Texto de la Pregunta *</label>
                  <textarea
                    id="text"
                    class="form-control"
                    formControlName="text"
                    rows="3"
                    [class.is-invalid]="isFieldInvalid('text')"
                    placeholder="Escribe aquí la pregunta del test..."
                  ></textarea>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('text')">
                    El texto de la pregunta es requerido
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="question_order" class="form-label">Orden *</label>
                  <input
                    type="number"
                    id="question_order"
                    class="form-control"
                    formControlName="question_order"
                    min="1"
                    [class.is-invalid]="isFieldInvalid('question_order')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('question_order')">
                    El orden es requerido
                  </div>
                  <small class="text-muted">Posición en el test</small>
                </div>
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6>Opciones de Respuesta</h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    (click)="addOption()"
                  >
                    <i class="material-icons me-1"></i>
                    Agregar Opción
                  </button>
                </div>

                <div formArrayName="options">
                  <div
                    *ngFor="let option of options.controls; let i = index"
                    [formGroupName]="i"
                    class="option-item mb-3"
                  >
                    <div class="card">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h6 class="mb-0">Opción {{ i + 1 }}</h6>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            (click)="removeOption(i)"
                            [disabled]="options.length <= 2"
                          >
                            <i class="material-icons">eliminar</i>
                          </button>
                        </div>

                        <div class="row">
                          <div class="col-md-6 mb-2">
                            <label class="form-label">Texto de la Opción *</label>
                            <input
                              type="text"
                              class="form-control"
                              formControlName="text"
                              placeholder="Texto de la opción..."
                            >
                          </div>
                          <div class="col-md-4 mb-2">
                            <label class="form-label">Aptitud *</label>
                            <select class="form-select" formControlName="aptitude_id">
                              <option value="">Seleccionar aptitud</option>
                              <option *ngFor="let aptitude of aptitudes" [value]="aptitude.id">
                                {{ aptitude.name }}
                              </option>
                            </select>
                          </div>
                          <div class="col-md-2 mb-2">
                            <label class="form-label">Peso</label>
                            <input
                              type="number"
                              class="form-control"
                              formControlName="weight"
                              min="0.1"
                              max="5"
                              step="0.1"
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="options.length < 2" class="alert alert-warning">
                  <i class="material-icons me-2">warning</i>
                  Una pregunta debe tener al menos 2 opciones
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="questionForm.invalid || isSaving || options.length < 2"
              >
                <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditMode ? 'Actualizar' : 'Crear' }} Pregunta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Question Modal -->
    <div class="modal fade" id="viewQuestionModal" tabindex="-1" *ngIf="selectedQuestion">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="material-icons me-2">quiz</i>
              Detalles de la Pregunta
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="question-details">
              <div class="row mb-3">
                <div class="col-md-8">
                  <h6>Pregunta</h6>
                  <p class="lead">{{ selectedQuestion.text }}</p>
                </div>
                <div class="col-md-4">
                  <h6>Información</h6>
                  <table class="table table-sm">
                    <tr>
                      <td><strong>Orden:</strong></td>
                      <td>{{ selectedQuestion.question_order }}</td>
                    </tr>
                    <tr>
                      <td><strong>Estado:</strong></td>
                      <td>
                        <span
                          class="badge"
                          [class]="selectedQuestion.active ? 'bg-success' : 'bg-secondary'"
                        >
                          {{ selectedQuestion.active ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Opciones:</strong></td>
                      <td>{{ selectedQuestion.options.length }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <h6>Opciones de Respuesta</h6>
              <div class="options-list">
                <div
                  *ngFor="let option of selectedQuestion.options; let i = index"
                  class="option-detail mb-2"
                >
                  <div class="card">
                    <div class="card-body py-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{{ getOptionLabel(i) }}.</strong>
                          {{ option.text }}
                        </div>
                        <div class="option-meta">
                          <span class="badge bg-primary me-2">{{ option.aptitude_name }}</span>
                          <span class="badge bg-secondary">Peso: {{ option.weight }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" (click)="editQuestion(selectedQuestion)">
              <i class="material-icons me-2">edit</i>
              Editar Pregunta
            </button>
          </div>
        </div>
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

    .question-text h6 {
      color: #333;
      font-weight: 600;
      line-height: 1.4;
    }

    .options-summary {
      font-size: 0.9rem;
    }

    .option-item {
      border-left: 4px solid #667eea;
      padding-left: 0;
    }

    .option-item .card {
      border-left: none;
      border-radius: 0 8px 8px 0;
    }

    .option-detail .card {
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;
    }

    .option-detail .card:hover {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }

    .option-meta {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
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

    .modal-xl {
      max-width: 1200px;
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

      .modal-xl {
        max-width: 95%;
      }
    }
  `,
  ],
})
export class QuestionManagementComponent implements OnInit {
  questionForm!: FormGroup
  questions: Question[] = []
  aptitudes: Aptitude[] = []
  selectedQuestion: Question | null = null
  isLoading = false
  isSaving = false
  isEditMode = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.loadQuestions()
    this.loadAptitudes()
  }

  private initForm(): void {
    this.questionForm = this.fb.group({
      text: ["", [Validators.required, Validators.minLength(10)]],
      question_order: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([]),
    })

    // Agregar 2 opciones por defecto
    this.addOption()
    this.addOption()
  }

  get options(): FormArray {
    return this.questionForm.get("options") as FormArray
  }

  addOption(): void {
    const optionGroup = this.fb.group({
      text: ["", [Validators.required]],
      aptitude_id: ["", [Validators.required]],
      weight: [1.0, [Validators.required, Validators.min(0.1), Validators.max(5)]],
    })

    this.options.push(optionGroup)
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index)
    }
  }

  loadQuestions(): void {
    this.isLoading = true
    this.errorMessage = ""

    this.adminService.getQuestions().subscribe({
      next: (questions) => {
        this.questions = questions.sort((a: Question, b: Question) => a.question_order - b.question_order)
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.error || "Error cargando preguntas"
        console.error("Error loading questions:", error)
      },
    })
  }

  loadAptitudes(): void {
    this.adminService.getAptitudes().subscribe({
      next: (aptitudes) => {
        this.aptitudes = aptitudes
      },
      error: (error) => {
        console.error("Error loading aptitudes:", error)
      },
    })
  }

  openCreateModal(): void {
    this.isEditMode = false
    this.selectedQuestion = null
    this.questionForm.reset()

    // Limpiar opciones y agregar 2 por defecto
    while (this.options.length !== 0) {
      this.options.removeAt(0)
    }
    this.addOption()
    this.addOption()

    // Establecer el siguiente orden disponible
    const maxOrder = Math.max(...this.questions.map((q) => q.question_order), 0)
    this.questionForm.patchValue({ question_order: maxOrder + 1 })

    const modal = new (window as any).bootstrap.Modal(document.getElementById("questionModal"))
    modal.show()
  }

  viewQuestion(question: Question): void {
    this.selectedQuestion = question
    const modal = new (window as any).bootstrap.Modal(document.getElementById("viewQuestionModal"))
    modal.show()
  }

  editQuestion(question: Question): void {
    this.isEditMode = true
    this.selectedQuestion = question

    // Cerrar modal de vista si está abierto
    const viewModal = (window as any).bootstrap.Modal.getInstance(document.getElementById("viewQuestionModal"))
    if (viewModal) {
      viewModal.hide()
    }

    // Limpiar opciones existentes
    while (this.options.length !== 0) {
      this.options.removeAt(0)
    }

    // Cargar datos de la pregunta
    this.questionForm.patchValue({
      text: question.text,
      question_order: question.question_order,
    })

    // Cargar opciones
    question.options.forEach((option) => {
      const optionGroup = this.fb.group({
        text: [option.text, [Validators.required]],
        aptitude_id: [option.aptitude_id, [Validators.required]],
        weight: [option.weight, [Validators.required, Validators.min(0.1), Validators.max(5)]],
      })
      this.options.push(optionGroup)
    })

    const modal = new (window as any).bootstrap.Modal(document.getElementById("questionModal"))
    modal.show()
  }

  toggleQuestionStatus(question: Question): void {
    const newStatus = !question.active
    const action = newStatus ? "activar" : "desactivar"

    if (confirm(`¿Estás seguro de que quieres ${action} esta pregunta?`)) {
      this.adminService.updateQuestion(question.id, { active: newStatus }).subscribe({
        next: () => {
          this.loadQuestions()
          alert(`Pregunta ${action}da exitosamente`)
        },
        error: (error) => {
          console.error("Error updating question:", error)
          alert("Error actualizando pregunta: " + (error.error?.error || "Error desconocido"))
        },
      })
    }
  }

  deleteQuestion(question: Question): void {
    if (confirm(`¿Estás seguro de que quieres eliminar esta pregunta?\n\n"${question.text}"`)) {
      this.adminService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.loadQuestions()
          alert("Pregunta eliminada exitosamente")
        },
        error: (error) => {
          console.error("Error deleting question:", error)
          alert("Error eliminando pregunta: " + (error.error?.error || "Error desconocido"))
        },
      })
    }
  }

  saveQuestion(): void {
    if (this.questionForm.valid && this.options.length >= 2) {
      this.isSaving = true
      const formData = {
        text: this.questionForm.value.text,
        question_order: this.questionForm.value.question_order,
        options: this.questionForm.value.options,
      }

      const request = this.isEditMode
        ? this.adminService.updateQuestion(this.selectedQuestion!.id, formData)
        : this.adminService.createQuestion(formData)

      request.subscribe({
        next: () => {
          this.isSaving = false
          this.loadQuestions()
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("questionModal"))
          modal.hide()
          alert(`Pregunta ${this.isEditMode ? "actualizada" : "creada"} exitosamente`)
        },
        error: (error) => {
          this.isSaving = false
          console.error("Error saving question:", error)
          alert("Error guardando pregunta: " + (error.error?.error || "Error desconocido"))
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  private markFormGroupTouched(): void {
    Object.keys(this.questionForm.controls).forEach((key) => {
      const control = this.questionForm.get(key)
      control?.markAsTouched()
    })

    // Mark options as touched
    this.options.controls.forEach((option) => {
      const formGroup = option as FormGroup
      Object.keys(formGroup.controls).forEach((key) => {
        formGroup.get(key)?.markAsTouched()
      })
    })
  }

  getActiveQuestionsCount(): number {
    return this.questions.filter((q) => q.active).length
  }

  getTotalOptionsCount(): number {
    return this.questions.reduce((total, question) => total + question.options.length, 0)
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  exportQuestions(): void {
    const exportData = {
      fecha_exportacion: new Date().toISOString(),
      total_preguntas: this.questions.length,
      preguntas_activas: this.getActiveQuestionsCount(),
      total_opciones: this.getTotalOptionsCount(),
      aptitudes_disponibles: this.aptitudes.length,
      preguntas: this.questions.map((question) => ({
        id: question.id,
        texto: question.text,
        orden: question.question_order,
        activa: question.active,
        opciones: question.options.map((option) => ({
          texto: option.text,
          aptitud: option.aptitude_name,
          peso: option.weight,
        })),
        fecha_creacion: question.created_at,
      })),
      aptitudes: this.aptitudes,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `preguntas_test_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index)
  }
}
