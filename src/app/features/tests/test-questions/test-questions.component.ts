import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { TestService } from "../../../core/services/test.service"
import { LoadingService } from "../../../core/services/loading.service"
import { Question, TestAnswer } from "../../../core/models/test.model"

@Component({
  selector: "app-test-questions",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Progress Header -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Test Vocacional</h5>
                <span class="badge bg-primary fs-6">
                  {{ currentQuestionIndex + 1 }} de {{ questions.length }}
                </span>
              </div>
              <div class="progress" style="height: 8px;">
                <div
                  class="progress-bar bg-gradient"
                  role="progressbar"
                  [style.width.%]="progressPercentage"
                  [attr.aria-valuenow]="progressPercentage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="d-flex justify-content-between mt-2">
                <small class="text-muted">Progreso: {{ progressPercentage }}%</small>
                <small class="text-muted">Tiempo estimado: {{ estimatedTimeLeft }} min</small>
              </div>
            </div>
          </div>

          <!-- Question Card -->
          <div class="card shadow-lg border-0" *ngIf="currentQuestion">
            <div class="card-body p-5">
              <div class="question-header mb-4">
                <div class="question-icon mb-3">
                  <i class="material-icons">help_outline</i>
                </div>
                <h3 class="question-text">{{ currentQuestion.text }}</h3>
                <p class="text-muted">Selecciona la opción que mejor te represente:</p>
              </div>

              <div class="options-container">
                <div
                  *ngFor="let option of currentQuestion.options; let i = index"
                  class="option-card mb-3"
                  [class.selected]="selectedOption?.id === option.id"
                  (click)="selectOption(option)"
                >
                  <div class="option-content">
                    <div class="option-radio">
                      <input
                        type="radio"
                        [id]="'option-' + option.id"
                        [name]="'question-' + currentQuestion.id"
                        [checked]="selectedOption?.id === option.id"
                        (change)="selectOption(option)"
                      >
                      <label [for]="'option-' + option.id" class="option-label">
                        <span class="option-letter">{{ getOptionLetter(i) }}</span>
                        <span class="option-text">{{ option.text }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="navigation-buttons mt-5">
                <div class="d-flex justify-content-between">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-lg"
                    [disabled]="currentQuestionIndex === 0"
                    (click)="previousQuestion()"
                  >
                    <i class="material-icons me-2"><i class="bi bi-arrow-left-circle-fill"></i></i>
                    Anterior
                  </button>

                  <button
                    type="button"
                    class="btn btn-primary btn-lg"
                    [disabled]="!selectedOption"
                    (click)="nextQuestion()"
                  >
                    <span *ngIf="currentQuestionIndex < questions.length - 1">
                      Siguiente
                      <i class="material-icons ms-2"><i class="bi bi-arrow-right-circle-fill"></i></i>
                    </span>
                    <span *ngIf="currentQuestionIndex === questions.length - 1">
                      Finalizar Test
                      <i class="material-icons ms-2">check</i>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isSubmitting" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Procesando...</span>
            </div>
            <h5>Procesando tus respuestas...</h5>
            <p class="text-muted">Esto puede tomar unos segundos</p>
          </div>

          <!-- Error State -->
          <div *ngIf="errorMessage" class="alert alert-danger mt-4">
            <i class="material-icons me-2">error</i>
            {{ errorMessage }}
            <button class="btn btn-sm btn-outline-danger ms-3" (click)="retrySubmission()">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .progress-bar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.5s ease;
    }

    .question-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .question-icon i {
      font-size: 40px;
      color: white;
    }

    .question-text {
      text-align: center;
      color: #333;
      font-weight: 600;
      line-height: 1.4;
    }

    .option-card {
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }

    .option-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .option-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2);
    }

    .option-content {
      display: flex;
      align-items: center;
    }

    .option-radio {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .option-radio input[type="radio"] {
      display: none;
    }

    .option-label {
      display: flex;
      align-items: center;
      width: 100%;
      cursor: pointer;
      margin: 0;
    }

    .option-letter {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #6c757d;
      margin-right: 15px;
      transition: all 0.3s ease;
    }

    .option-card.selected .option-letter {
      background: #667eea;
      color: white;
    }

    .option-text {
      flex: 1;
      font-size: 16px;
      line-height: 1.5;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .navigation-buttons {
      border-top: 1px solid #e9ecef;
      padding-top: 30px;
    }

    @media (max-width: 768px) {
      .card-body {
        padding: 30px 20px !important;
      }

      .option-card {
        padding: 15px;
      }

      .option-letter {
        width: 35px;
        height: 35px;
        margin-right: 10px;
      }

      .navigation-buttons .btn {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  `,
  ],
})
export class TestQuestionsComponent implements OnInit {
  questions: Question[] = []
  currentQuestionIndex = 0
  answers: TestAnswer[] = []
  selectedOption: any = null
  isSubmitting = false
  errorMessage = ""

  constructor(
    private testService: TestService,
    private router: Router,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadQuestions()
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] || null
  }

  get progressPercentage(): number {
    if (this.questions.length === 0) return 0
    return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100)
  }

  get estimatedTimeLeft(): number {
    const questionsLeft = this.questions.length - this.currentQuestionIndex - 1
    return Math.ceil(questionsLeft * 1.5) // 1.5 minutos por pregunta
  }

  private loadQuestions(): void {
    this.loadingService.show()
    this.testService.getQuestions().subscribe({
      next: (questions) => {
        this.questions = questions
        this.loadingService.hide()
        this.loadSavedAnswer()
      },
      error: (error) => {
        this.loadingService.hide()
        this.errorMessage = "Error cargando las preguntas. Por favor, intenta nuevamente."
        console.error("Error loading questions:", error)
      },
    })
  }

  private loadSavedAnswer(): void {
    const savedAnswer = this.answers.find((a) => a.question_id === this.currentQuestion?.id)
    if (savedAnswer && this.currentQuestion) {
      this.selectedOption = this.currentQuestion.options.find((o) => o.id === savedAnswer.option_id)
    } else {
      this.selectedOption = null
    }
  }

  selectOption(option: any): void {
    this.selectedOption = option
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index) // A, B, C, D...
  }

  nextQuestion(): void {
    if (!this.selectedOption || !this.currentQuestion) return

    // Guardar respuesta
    this.saveCurrentAnswer()

    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Ir a la siguiente pregunta
      this.currentQuestionIndex++
      this.loadSavedAnswer()
    } else {
      // Finalizar test
      this.submitTest()
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--
      this.loadSavedAnswer()
    }
  }

  private saveCurrentAnswer(): void {
    if (!this.selectedOption || !this.currentQuestion) return

    // Remover respuesta anterior para esta pregunta
    this.answers = this.answers.filter((a) => a.question_id !== this.currentQuestion!.id)

    // Agregar nueva respuesta
    this.answers.push({
      question_id: this.currentQuestion.id,
      option_id: this.selectedOption.id,
    })
  }

  private submitTest(): void {
    this.isSubmitting = true
    this.errorMessage = ""

    this.testService.submitTest(this.answers).subscribe({
      next: (result) => {
        this.isSubmitting = false
        // Usar result.testId si existe, sino result.id
        const testId = Number(result?.id ?? result?.testId)
        console.log("Respuesta del backend:", result)
        console.log("Valor de testId:", testId)
        if (testId > 0 && !isNaN(testId)) {
          this.router.navigate(["/test/results", testId])
        } else {
          this.errorMessage = "No se pudo obtener el resultado del test. Intenta nuevamente."
          console.error("Resultado inválido:", result)
        }
      },
      error: (error) => {
        this.isSubmitting = false
        this.errorMessage = error.error?.error || "Error enviando el test. Por favor, intenta nuevamente."
        console.error("Error submitting test:", error)
      },
    })
  }

  retrySubmission(): void {
    this.errorMessage = ""
    this.submitTest()
  }
}
