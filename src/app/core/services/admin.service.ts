import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { User } from "../models/user.model"
import { University } from "../models/university.model"

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalTests: number
  testsToday: number
  totalUniversities: number
  activeQuestions: number
  activeUsers: User[]
  testsPerDay: Array<{ date: string; count: number }>
}

interface Question {
  id: number
  text: string
  question_order: number
  active: boolean
  options: QuestionOption[]
  created_at: string
}

interface QuestionOption {
  id: number
  text: string
  aptitude_id: number
  aptitude_name: string
  weight: number
}

interface Aptitude {
  id: number
  name: string
  description: string
}

interface UniversityStats {
  total: number
  byType: Array<{ type: string; count: number }>
  byCountry: Array<{ country: string; count: number }>
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`

  constructor(private http: HttpClient) {}

  // Dashboard Stats
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`)
  }

  // User Management
  getUsers(filters: any = {}): Observable<UsersResponse> {
    let params = new HttpParams()

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params = params.set(key, filters[key].toString())
      }
    })

    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, { params })
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`)
  }

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData)
  }

  // University Management
  getUniversitiesStats(): Observable<UniversityStats> {
    return this.http.get<UniversityStats>(`${this.apiUrl}/universities/stats`)
  }

  createUniversity(universityData: any): Observable<University> {
    return this.http.post<University>(`${this.apiUrl}/universities`, universityData)
  }

  updateUniversity(universityId: number, universityData: any): Observable<University> {
    return this.http.put<University>(`${this.apiUrl}/universities/${universityId}`, universityData)
  }

  deleteUniversity(universityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/universities/${universityId}`)
  }

  // Question Management
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions`)
  }

  createQuestion(questionData: any): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions`, questionData)
  }

  updateQuestion(questionId: number, questionData: any): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${questionId}`, questionData)
  }

  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/questions/${questionId}`)
  }

  getAptitudes(): Observable<Aptitude[]> {
    return this.http.get<Aptitude[]>(`${this.apiUrl}/aptitudes`)
  }
}
