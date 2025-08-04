import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap, catchError, throwError } from "rxjs"
import { Router } from "@angular/router"
import { environment } from "../../../environments/environment"
import { User, LoginRequest, RegisterRequest, AuthResponse } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.apiUrl
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage()
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        this.currentUserSubject.next(user)
      } catch (error) {
        this.logout()
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem("token", response.token)
          localStorage.setItem("user", JSON.stringify(response.user))
          this.currentUserSubject.next(response.user)
        }
      }),
      catchError((error) => {
        console.error("Login error:", error)
        return throwError(() => error)
      }),
    )
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      catchError((error) => {
        console.error("Register error:", error)
        return throwError(() => error)
      }),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    this.currentUserSubject.next(null)
    this.router.navigate(["/auth/login"])
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user))
    this.currentUserSubject.next(user)
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("token")
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp > Date.now() / 1000
    } catch {
      return false
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === "admin"
  }
}
