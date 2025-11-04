// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/api'; // usa environment si lo tienes
  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';

  // ✅ Estado reactivo del usuario
  private currentUserSubject = new BehaviorSubject<any | null>(this.readUserFromStorage());
  public currentUser$: Observable<any | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ========= ENDPOINTS BACKEND =========
  register(payload: any): Observable<any> {
    return this.http.post(`${this.api}/auth/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.api}/auth/login`, payload);
  }

  forgotPasswordOtp(email: string): Observable<any> {
    return this.http.post(`${this.api}/auth/forgot-password-otp`, { email });
  }

  verifyOtp(email: string, code: string): Observable<any> {
    return this.http.post(`${this.api}/auth/verify-otp`, { email, code });
  }

  resetPasswordWithOtp(newPassword: string, resetToken: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${resetToken}`);
    return this.http.post(
      `${this.api}/auth/reset-password-otp`,
      { new_password: newPassword },
      { headers }
    );
  }

  // ====== Helpers recomendados (Opción A) ======

  /** Snapshot del usuario actual (o null si no hay sesión) */
  getCurrentUser(): any | null {
    // Usa el estado en memoria; si por alguna razón está vacío, intenta leer del storage
    return this.currentUserSubject?.value ?? this.readUserFromStorage();
  }

  /** Actualiza el usuario actual en memoria y localStorage (sin tocar el token) */
  updateCurrentUser(updated: any): void {
    const prev = this.getCurrentUser();
    const merged = prev ? { ...prev, ...updated } : updated;

    localStorage.setItem(this.USER_KEY, JSON.stringify(merged));
    this.currentUserSubject.next(merged); // notifica a quienes están suscritos a currentUser$
  }

  /** Atajo opcional para exponer el observable del usuario actual */
  currentUserObservable() {
    return this.currentUser$;
  }

  // ========= SESIÓN / TOKEN =========
  setSession(token: string, user: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);               // 🔔 Notifica a los que se suscriben
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);               // 🔔 Notifica logout
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      if (payload?.exp) {
        const now = Math.floor(Date.now() / 1000);
        return now < payload.exp;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Observable por si lo prefieres reactivo en guards o templates
  isAuthenticated$ = this.currentUser$.pipe(
    map(() => this.isAuthenticated())
  );

  // ========= USER / ROLES =========
  getUser(): any | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const u = this.getUser();
    return u ? u.role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  // ========= Helpers internos =========
  private readUserFromStorage(): any | null {
    const txt = localStorage.getItem(this.USER_KEY);
    if (!txt) return null;
    try {
      return JSON.parse(txt);
    } catch {
      return null;
    }
  }

  private base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(padded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
