import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, catchError, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { User } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  updateProfile(userId: number, userData: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      catchError((error) => {
        console.error("Error updating profile:", error)
        return throwError(() => error)
      }),
    )
  }

  getUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError((error) => {
        console.error("Error fetching user profile:", error)
        return throwError(() => error)
      }),
    )
  }
}
