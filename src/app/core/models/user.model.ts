export interface User {
  id: number
  name: string
  email: string
  age?: number
  location?: string
  education_level?: string
  interests?: string
  role: "user" | "admin"
  created_at: string
  updated_at?: string
  last_login?: string;
  tests_count?: number;
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  age?: number
  location?: string
  education_level?: string
  interests?: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
  message?: string
}
