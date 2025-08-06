export interface Question {
  id: number
  text: string
  category: string
  options: QuestionOption[]
}

export interface QuestionOption {
  id: number
  text: string
  aptitude_type: string
  weight: number
}

export interface TestAnswer {
  question_id: number
  option_id: number
}

export interface Aptitude {
  id: number
  name: string
  description: string
  score: number
}

export interface CareerRecommendation {
  id: number
  name: string
  description?: string
  duration_years?: number
  match_percentage?: number
}

export interface TestResult {
  id: number
  testId?: number
  completed_at?: string
  user_id?: number
  aptitudes: Aptitude[]
  careers: CareerRecommendation[]
  recommendations: any[]
}
