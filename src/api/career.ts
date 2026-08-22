export interface CareerRecommendationItem {
  id: string
  careerId?: string
  career: string
  matchPercentage: number
  reasons: string[]
  requiredSkills: string[]
}

export interface CareerDetailBackendResponse {
  id: string
  title: string
  description: string
  requiredSkills: string[]
  demandLevel: string
  avgSalary?: string
  createdAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : 'Career API request failed')
    const error = new Error(errorMsg)
    ;(error as any).status = response.status
    throw error
  }
  return data as T
}

export async function getCareerRecommendationsApi(token: string): Promise<CareerRecommendationItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/careers/recommendations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<CareerRecommendationItem[]>(res)
}

export async function getCareerByIdApi(token: string, id: string): Promise<CareerDetailBackendResponse> {
  const res = await fetch(`${API_BASE_URL}/api/careers/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<CareerDetailBackendResponse>(res)
}

export async function getAllCareersApi(token: string): Promise<CareerDetailBackendResponse[]> {
  const res = await fetch(`${API_BASE_URL}/api/careers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<CareerDetailBackendResponse[]>(res)
}
