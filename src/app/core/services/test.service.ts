import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable, catchError, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { Question, TestAnswer, TestResult } from "../models/test.model"

@Injectable({
  providedIn: "root",
})
export class TestService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token") // Ajusta si usas otro storage
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    })
  }

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/test/questions`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        console.error("Error fetching questions:", error)
        return throwError(() => error)
      }),
    )
  }

  submitTest(answers: TestAnswer[]): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.apiUrl}/test`, { answers }, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        console.error("Error submitting test:", error)
        return throwError(() => error)
      }),
    )
  }

  getTestResults(testId: number): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/test/${testId}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        console.error("Error fetching test results:", error)
        return throwError(() => error)
      }),
    )
  }

  getUserTestHistory(userId: number): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(`${this.apiUrl}/users/${userId}/tests`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        console.error("Error fetching test history:", error)
        return throwError(() => error)
      }),
    )
  }
}
