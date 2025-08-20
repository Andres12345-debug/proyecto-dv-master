import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Career } from "../models/career.model";

@Injectable({
  providedIn: "root"
})
export class CareerService {
  private apiUrl = "/api/careers"; // 🔹 Endpoint base

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las carreras
 getAllCareers(): Observable<Career[]> {
  const token = localStorage.getItem("token");
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.get<Career[]>(`${this.apiUrl}/all`, { headers }).pipe(
    tap((response) => {
      console.log("📦 Respuesta cruda del backend (all careers):", response);
    }),
    map((careers) =>
      careers.map((career) => ({
        id: career.id,
        name: career.name || "Carrera desconocida",
        description: career.description || "",
        duration_years: career.duration_years ?? 0,
        aptitudes: career.aptitudes || [],
      }))
    ),
    catchError((error) => {
      console.error("❌ Error obteniendo todas las carreras:", error);
      return of([]);
    })
  );
}


  // ✅ Obtener carrera por ID
  getCareerById(id: number): Observable<Career> {
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Career>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap((response) => {
        console.log("📦 Respuesta cruda del backend (career):", response);
      }),
      map((career) => ({
        id: career.id,
        name: career.name || "Carrera desconocida",
        description: career.description || "",
        duration_years: career.duration_years ?? 0,
        aptitudes: career.aptitudes || []
      })),
      catchError((error) => {
        console.error(`❌ Error obteniendo carrera ${id}:`, error);
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
