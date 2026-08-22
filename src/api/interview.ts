const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface StartInterviewPayload {
  type?: 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'DSA' | 'JAVA' | 'FULL_STACK';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface StartInterviewResponse {
  interviewId: string;
  type: string;
  difficulty: string;
  question: {
    id: string;
    text: string;
    category: string;
    orderIndex: number;
  };
}

export interface SubmitAnswerPayload {
  questionId: string;
  answerText: string;
}

export interface InterviewEvaluation {
  correctness: number;
  communication: number;
  technicalDepth: number;
  overallScore: number;
  feedback: string;
}

export interface SubmitAnswerResponse {
  answerId: string;
  evaluation: InterviewEvaluation;
  nextQuestion: {
    id: string;
    text: string;
    category: string;
    orderIndex: number;
  } | null;
  interviewCompleted: boolean;
}

export interface InterviewHistoryItem {
  id: string;
  type: string;
  difficulty: string;
  status: string;
  questionCount: number;
  averageScore: number;
  createdAt: string;
}

export async function startInterviewApi(
  token: string,
  payload?: StartInterviewPayload
): Promise<StartInterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interviews/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload || { type: 'TECHNICAL', difficulty: 'MEDIUM' })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to start interview (${response.status})`);
  }

  return response.json();
}

export async function submitInterviewAnswerApi(
  token: string,
  interviewId: string,
  payload: SubmitAnswerPayload
): Promise<SubmitAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to submit answer (${response.status})`);
  }

  return response.json();
}

export async function getInterviewHistoryApi(
  token: string
): Promise<InterviewHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/interviews/history`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch interview history (${response.status})`);
  }

  return response.json();
}
