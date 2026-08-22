export interface ResumeData {
  id?: string
  fileName?: string
  fileUrl?: string
  technicalSkills?: { name: string; level: number }[]
  projects?: { title: string; description: string; technologies: string[]; link: string | null }[]
  experience?: { role: string; company: string; duration: string; description: string }[]
  certifications?: { name: string; issuer: string }[]
  strengths?: string[]
  weaknesses?: string[]
  feedback?: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors ? Object.values(data.errors).join(', ') : `Resume request failed (${response.status})`)
    throw new Error(errorMsg)
  }
  return data as T
}

export async function uploadResumeApi(token: string, file: File): Promise<ResumeData> {
  const formData = new FormData()
  formData.append('resume', file)

  const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  return handleResponse<ResumeData>(res)
}

export async function getLatestResumeApi(token: string): Promise<ResumeData | null> {
  const res = await fetch(`${API_BASE_URL}/api/resume`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 404) return null
  return handleResponse<ResumeData>(res)
}
