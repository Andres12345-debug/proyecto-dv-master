import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { Career } from "../models/career.model";

@Injectable({ providedIn: "root" })
export class CareerService {
  // ✅ Usa environment.apiUrl (ej: "http://localhost:3000/api")
  private baseUrl = `${environment.apiUrl}/careers`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  // ✅ Listar todas las carreras
  getAllCareers(): Observable<Career[]> {
    return this.http.get<Career[]>(`${this.baseUrl}/all`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap((resp) => {
        // Si el backend devolviera HTML por error, "resp" sería un objeto raro / string.
        // Angular habría fallado antes con HttpErrorResponse, pero dejamos el log.
        console.log("📦 Respuesta (all careers):", resp);
      }),
      map((careers) =>
        (careers ?? []).map((career: any) => ({
          id: career.id,
          name: career.name || "Carrera desconocida",
          description: career.description || "",
          duration_years: career.duration_years ?? 0,
          aptitudes: career.aptitudes || [],
        }))
      ),
      catchError((err) => {
        console.error("❌ Error obteniendo todas las carreras:", {
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          message: err?.message,
          // Si ves <!doctype...> aquí, estás recibiendo HTML (index.html)
          error: err?.error
        });
        return of([]); // devuelve lista vacía para no romper la UI
      })
    );
  }

  // ✅ Obtener carrera por ID
  getCareerById(id: number): Observable<Career> {
    return this.http.get<Career>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      tap((resp) => {
        console.log("📦 Respuesta (career by id):", resp);
      }),
      map((career: any) => ({
        id: career.id,
        name: career.name || "Carrera desconocida",
        description: career.description || "",
        duration_years: career.duration_years ?? 0,
        aptitudes: career.aptitudes || [],
      })),
      catchError((err) => {
        console.error(`❌ Error obteniendo carrera ${id}:`, {
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          message: err?.message,
          error: err?.error
        });
        // 👉 Si prefieres propagar el error al componente, usa:
        // return throwError(() => err)
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
