import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Career } from "../models/career.model";

@Injectable({
  providedIn: "root"
})
export class CareerService {
  private apiUrl = "/api/careers";

  constructor(private http: HttpClient) {}

  getCareerById(id: number): Observable<Career> {
    const token = localStorage.getItem("token"); // JWT guardado
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Career>(`${this.apiUrl}/${id}`, { headers }).pipe(
      map((career) => ({
        // Garantizamos que todos los campos obligatorios existan
        id: career.id,
        name: career.name || "Carrera desconocida",
        description: career.description || "",
        duration_years: career.duration_years ?? 0,
        aptitudes: career.aptitudes || []
      })),
      catchError((error) => {
        console.error(`Error obteniendo carrera ${id}:`, error);
        // Devolver un objeto por defecto para no romper la UI
        return of({
          id,
          name: "Carrera no encontrada",
          description: "",
          duration_years: 0,
          aptitudes: []
        } as Career);
      })
    );
  }
}
