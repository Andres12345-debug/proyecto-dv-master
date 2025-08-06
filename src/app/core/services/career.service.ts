import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { Career } from "../models/career.model"

@Injectable({
  providedIn: "root"
})
export class CareerService {
  private apiUrl = "/api/careers"

  constructor(private http: HttpClient) {}

  getCareers(): Observable<Career[]> {
    return this.http.get<Career[]>(this.apiUrl)
  }

  getCareerById(id: number): Observable<Career> {
    return this.http.get<Career>(`${this.apiUrl}/${id}`)
  }

  createCareer(career: Partial<Career>): Observable<Career> {
    return this.http.post<Career>(this.apiUrl, career)
  }

  updateCareer(id: number, career: Partial<Career>): Observable<Career> {
    return this.http.put<Career>(`${this.apiUrl}/${id}`, career)
  }

  deleteCareer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}