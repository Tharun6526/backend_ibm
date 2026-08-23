const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface BackendRoadmapTask {
  id: string;
  title: string;
  description?: string;
  skill: string;
  duration?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  resources?: string[];
}

export interface BackendRoadmap {
  id: string;
  title: string;
  targetCareer: string;
  durationMonths?: number;
  tasks: BackendRoadmapTask[];
}

export async function getRoadmapApi(token: string): Promise<BackendRoadmap> {
  const response = await fetch(`${API_BASE_URL}/api/roadmap`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch roadmap (${response.status})`);
  }

  return response.json();
}

export async function generateRoadmapApi(token: string): Promise<BackendRoadmap> {
  const response = await fetch(`${API_BASE_URL}/api/roadmap/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to generate roadmap (${response.status})`);
  }

  return response.json();
}

export async function updateTaskStatusApi(
  token: string,
  taskId: string,
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
): Promise<BackendRoadmapTask> {
  const response = await fetch(`${API_BASE_URL}/api/roadmap/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update task status (${response.status})`);
  }

  return response.json();
}
