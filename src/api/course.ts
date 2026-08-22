const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface BackendCourse {
  id: string;
  courseName: string;
  provider: string;
  skillName: string;
  difficulty: string;
  duration: string;
  description: string;
  externalUrl?: string;
  userProgress: number;
  completionStatus: boolean;
}

export interface BackendCourseProgressResponse {
  courseId: string;
  progress: number;
  completionStatus: boolean;
  updatedAt?: string;
}

export async function getCoursesApi(token: string): Promise<BackendCourse[]> {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch courses (${response.status})`);
  }

  return response.json();
}

export async function getRecommendedCoursesApi(token: string): Promise<BackendCourse[]> {
  const response = await fetch(`${API_BASE_URL}/api/courses/recommended`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch recommended courses (${response.status})`);
  }

  return response.json();
}

export async function updateCourseProgressApi(
  token: string,
  courseId: string,
  progress: number
): Promise<BackendCourseProgressResponse> {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ progress })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update course progress (${response.status})`);
  }

  return response.json();
}
