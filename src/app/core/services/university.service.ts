import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable, catchError, throwError } from "rxjs"
import { environment } from "../../../environments/environment"
import { University, UniversityFilters, UniversityResponse } from "../models/university.model"

@Injectable({
  providedIn: "root",
})
export class UniversityService {
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  getUniversities(filters?: UniversityFilters): Observable<UniversityResponse> {
    let params = new HttpParams()

    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof UniversityFilters]
        if (value !== undefined && value !== null && value !== "") {
          params = params.set(key, value.toString())
        }
      })
    }

    return this.http.get<UniversityResponse>(`${this.apiUrl}/universities`, { params }).pipe(
      catchError((error) => {
        console.error("Error fetching universities:", error)
        return throwError(() => error)
      }),
    )
  }

  getUniversityById(id: number): Observable<University> {
    return this.http.get<University>(`${this.apiUrl}/universities/${id}`).pipe(
      catchError((error) => {
        console.error("Error fetching university:", error)
        return throwError(() => error)
      }),
    )
  }

  getCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/universities/countries`).pipe(
      catchError((error) => {
        console.error("Error fetching countries:", error)
        return throwError(() => error)
      }),
    )
  }
}
