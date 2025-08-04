export interface University {
  id: number;
  name: string;
  location: string;
  country: string;
  rating: number;
  type: string;
  modality: string;
  website?: string;
  description?: string;
  careers?: Career[];
  career_count?: number
  admission_requirements?: string;
  contact_email?: string;
  contact_phone?: string;
  aptitudes?: Aptitude[];
}


export interface Career {
  id: number
  name: string
  description?: string
  duration_years: number
  aptitudes_required: string[]
}

export interface UniversityFilters {
  search?: string
  country?: string
  type?: "publica" | "privada"
  modality?: "presencial" | "virtual" | "mixta"
  page?: number
  limit?: number
}

export interface UniversityResponse {
  universities: University[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface Aptitude {
  name: string;
  description?: string;
  strength_level: number;
}
