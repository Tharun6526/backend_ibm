export interface GithubRepository {
  name: string
  description?: string | null
  language?: string | null
  stars: number
  forks?: number
  url: string
}

export interface GithubProfileData {
  username: string
  avatarUrl?: string
  bio?: string | null
  publicRepos: number
  followers: number
  following: number
  profileUrl: string
  analysis?: {
    projectQuality?: string
    complexityScore?: number
    relevanceScore?: number
    summary?: string
    topLanguages?: string[]
  } | null
  repositories?: GithubRepository[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : 'GitHub request failed')
    throw new Error(errorMsg)
  }
  return data as T
}

export function extractGithubUsername(urlOrName: string): string {
  const trimmed = urlOrName.trim().replace(/\/+$/, '')
  if (trimmed.includes('github.com/')) {
    const parts = trimmed.split('github.com/')
    return parts[1].split('/')[0]
  }
  return trimmed
}

export async function connectGithubApi(token: string, username: string): Promise<GithubProfileData> {
  const cleanUsername = extractGithubUsername(username)
  const res = await fetch(`${API_BASE_URL}/api/github/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username: cleanUsername }),
  })
  return handleResponse<GithubProfileData>(res)
}

export async function getGithubProfileApi(token: string): Promise<GithubProfileData | null> {
  const res = await fetch(`${API_BASE_URL}/api/github/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 404) return null
  return handleResponse<GithubProfileData>(res)
}
