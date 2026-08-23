const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface BackendReadinessBreakdown {
  technicalSkills: number;
  dsa: number;
  projects: number;
  resume: number;
  github: number;
  interview: number;
}

export interface BackendReadinessResponse {
  overallScore: number;
  breakdown: BackendReadinessBreakdown;
  status: string;
  improvements: string[];
}

export async function getReadinessApi(token: string): Promise<BackendReadinessResponse> {
  const response = await fetch(`${API_BASE_URL}/api/readiness`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch readiness score (${response.status})`);
  }

  return response.json();
}

export async function calculateReadinessApi(token: string): Promise<BackendReadinessResponse> {
  const response = await fetch(`${API_BASE_URL}/api/readiness/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to calculate readiness score (${response.status})`);
  }

  return response.json();
}
