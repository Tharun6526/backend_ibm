const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChatMessagePayload {
  message: string;
  history?: Array<{ role: string; text: string }>;
}

export interface ChatResponse {
  reply: string;
}

export async function sendCopilotChatApi(
  token: string,
  payload: ChatMessagePayload
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/copilot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to send message (${response.status})`);
  }

  return response.json();
}
