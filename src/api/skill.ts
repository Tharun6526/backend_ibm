export interface SkillGapItem {
  id: string
  skill: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  recommendedActions: string[]
}

export interface UserSkillItem {
  id: string
  userId: string
  skillId?: string | null
  skillName: string
  level: number
  createdAt?: string
  updatedAt?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : 'Skill API request failed')
    const error = new Error(errorMsg)
    ;(error as any).status = response.status
    throw error
  }
  return data as T
}

export async function getSkillGapsApi(token: string): Promise<SkillGapItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/skills/gaps`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<SkillGapItem[]>(res)
}

export async function getUserSkillsApi(token: string): Promise<UserSkillItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/skills/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<UserSkillItem[]>(res)
}

export async function analyzeSkillGapApi(token: string): Promise<SkillGapItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/skills/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<SkillGapItem[]>(res)
}
