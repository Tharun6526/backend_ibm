export interface CareerRecommendationItem {
  id: string
  career: string
  matchPercentage: number
  reasons: string[]
  requiredSkills: string[]
}

export interface SkillGapItem {
  id: string
  skill: string
  currentLevel: number
  requiredLevel: number
  gap: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  recommendedActions: string[]
}

export interface RoadmapTaskItem {
  id: string
  title: string
  description: string
  skill: string
  duration: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  resources: string[]
}

export interface RoadmapData {
  id: string
  title: string
  targetCareer: string
  durationMonths: number
  tasks: RoadmapTaskItem[]
}

export interface AnalysisResults {
  recommendations: CareerRecommendationItem[]
  skillGaps: SkillGapItem[]
  roadmap: RoadmapData | null
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : 'Analysis request failed')
    throw new Error(errorMsg)
  }
  return data as T
}

export async function triggerCareerRecommendationsApi(token: string): Promise<CareerRecommendationItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/careers/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<CareerRecommendationItem[]>(res)
}

export async function triggerSkillGapAnalysisApi(token: string): Promise<SkillGapItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/skills/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<SkillGapItem[]>(res)
}

export async function generateUserRoadmapApi(token: string): Promise<RoadmapData> {
  const res = await fetch(`${API_BASE_URL}/api/roadmap/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse<RoadmapData>(res)
}

export async function runFullAnalysisApi(token: string): Promise<AnalysisResults> {
  // Step 1: Recommend careers
  const recommendations = await triggerCareerRecommendationsApi(token)
  // Step 2: Analyze skill gaps
  const skillGaps = await triggerSkillGapAnalysisApi(token)
  // Step 3: Generate roadmap
  const roadmap = await generateUserRoadmapApi(token).catch(() => null)

  return {
    recommendations,
    skillGaps,
    roadmap,
  }
}
