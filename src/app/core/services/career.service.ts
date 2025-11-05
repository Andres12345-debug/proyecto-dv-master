import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { Career } from "../models/career.model";

export interface PaginatedCareers {
  data: Career[];
  total: number;
  page: number;
  limit: number;
}

// DTOs para CRUD
export interface CreateCareerDto {
  name: string;
  description?: string | null;
  duration_years?: number | null;
}
export type UpdateCareerDto = Partial<CreateCareerDto>;

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

  // ======= LECTURA =======

  // Todas (sin paginar)
  getAllCareers(): Observable<Career[]> {
    return this.http
      .get<any[]>(`${this.baseUrl}/all`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((resp) => console.log("📦 Respuesta (all careers):", resp)),
        map((rows) => (rows ?? []).map((r) => this.mapCareer(r))),
        catchError((err) => {
          console.error("❌ Error obteniendo todas las carreras:", err);
          return of([]);
        })
      );
  }

  // Por ID
  getCareerById(id: number): Observable<Career> {
    return this.http
      .get<any>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        tap((resp) => console.log("📦 Respuesta (career by id):", resp)),
        map((raw) => this.mapCareer(raw)),
        catchError((err) => {
          console.error(`❌ Error obteniendo carrera ${id}:`, err);
          return of({
            id,
            name: "Carrera no encontrada",
            description: "",
            duration_years: 0,
            aptitudes: [],
          } as Career);
        })
      );
  }

  // Listado paginado + search (para panel admin)
  list(page = 1, limit = 20, search = ""): Observable<PaginatedCareers> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    if (search) params = params.set("search", search);

    return this.http
      .get<any>(`${this.baseUrl}`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        map((res) => ({
          data: (res?.data ?? []).map((r: any) => this.mapCareer(r)),
          total: res?.total ?? 0,
          page: res?.page ?? page,
          limit: res?.limit ?? limit,
        })),
        catchError((err) => {
          console.error("❌ Error list careers:", err);
          return of({ data: [], total: 0, page, limit });
        })
      );
  }

  // ======= CRUD (ADMIN) =======

  create(payload: CreateCareerDto): Observable<any> {
    return this.http
      .post<any>(this.baseUrl, payload, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error("❌ Error creando carrera:", err);
          throw err;
        })
      );
  }

  update(id: number, payload: UpdateCareerDto): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/${id}`, payload, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error("❌ Error actualizando carrera:", err);
          throw err;
        })
      );
  }

  remove(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error("❌ Error eliminando carrera:", err);
          throw err;
        })
      );
  }

  // ======= MAPEO CENTRAL =======
  private mapCareer(raw: any): Career {
    return {
      id: Number(raw?.id),
      name: String(raw?.name ?? "Carrera desconocida"),
      description: raw?.description ?? "",
      // Tu modelo requiere number: coaccionamos null/undefined a 0
      duration_years:
        raw?.duration_years == null ? 0 : Number(raw.duration_years),
      aptitudes: Array.isArray(raw?.aptitudes)
        ? raw.aptitudes.map((a: any) => ({
            id: Number(a?.id),
            name: String(a?.name ?? ""),
            description: a?.description ?? "",
            // Llega si el backend lo expone (opcional)
            importance_level:
              a?.importance_level == null
                ? undefined
                : Number(a.importance_level),
          }))
        : [],
    };
  }
}
