export interface Career {
  id: number
  name: string
  description?: string
  duration_years: number
  aptitudes?: Aptitude[]
}

export interface Aptitude {
  id: number
  name: string
  description?: string
  importance_level?: number
}