import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable, catchError, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { Question, TestAnswer, TestResult } from "../models/test.model"
import { Career } from "../models/career.model"  // 👈 Asegúrate de tener este modelo

@Injectable({
  providedIn: "root",
})
export class TestService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token")
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  // 🧠 Obtener todas las preguntas del test
  getQuestions(): Observable<Question[]> {
    return this.http
      .get<Question[]>(`${this.apiUrl}/test/questions`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error fetching questions:", error)
          return throwError(() => error)
        })
      )
  }

  // 📝 Enviar respuestas del test
  submitTest(answers: TestAnswer[]): Observable<TestResult> {
    return this.http
      .post<TestResult>(
        `${this.apiUrl}/test`,
        { answers },
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        catchError((error) => {
          console.error("Error submitting test:", error)
          return throwError(() => error)
        })
      )
  }

  // 📊 Obtener resultados de un test específico
  getTestResults(testId: number): Observable<TestResult> {
    return this.http
      .get<TestResult>(`${this.apiUrl}/test/${testId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error fetching test results:", error)
          return throwError(() => error)
        })
      )
  }

  // 🕓 Historial de tests de un usuario
  getUserTestHistory(userId: number): Observable<TestResult[]> {
    return this.http
      .get<TestResult[]>(`${this.apiUrl}/users/${userId}/tests`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error fetching test history:", error)
          return throwError(() => error)
        })
      )
  }

  // 🎓 NUEVO: Listar todas las carreras desde el backend
  getAllCareers(): Observable<Career[]> {
    return this.http
      .get<Career[]>(`${this.apiUrl}/careers/all`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error fetching careers:", error)
          return throwError(() => error)
        })
      )
  }

  // (Opcional) 🎓 Si también tienes el endpoint con aptitudes:
  getAllCareersWithAptitudes(): Observable<Career[]> {
    return this.http
      .get<Career[]>(`${this.apiUrl}/careers/all/with-aptitudes`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error("Error fetching careers with aptitudes:", error)
          return throwError(() => error)
        })
      )
  }
}
