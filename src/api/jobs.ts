const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface LiveJobItem {
  id: string;
  role: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  matchScore: number;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  appliedDate?: string;
  logo?: string;
}

export async function getLiveJobsApi(
  token: string,
  query?: string
): Promise<LiveJobItem[]> {
  const url = query
    ? `${API_BASE_URL}/api/jobs/search?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/jobs/search`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch live jobs (${response.status})`);
  }

  return response.json();
}
