export interface ProfileData {
  id?: string
  userId?: string
  college?: string | null
  degree?: string | null
  branch?: string | null
  graduationYear?: number | null
  careerGoal?: string | null
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  hoursPerDay?: number
  preferredLearningStyle?: string | null
  targetMonths?: number
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface ProfilePayload {
  name?: string
  college?: string
  degree?: string
  branch?: string
  graduationYear?: number
  careerGoal?: string
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  hoursPerDay?: number
  preferredLearningStyle?: string
  targetMonths?: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : 'Profile request failed')
    throw new Error(errorMsg)
  }
  return data as T
}

export async function getProfileApi(token: string): Promise<ProfileData> {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<ProfileData>(res)
}

export async function updateProfileApi(token: string, payload: ProfilePayload): Promise<ProfileData> {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  return handleResponse<ProfileData>(res)
}
