import { api } from './client';
import type { ChatMessage } from '../types';

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export const chatApi = {
  stream: (message: string, sessionId?: string) =>
    api.stream('/chat/stream', { message, session_id: sessionId }),

  getHistory: (sessionId?: string) => {
    const endpoint = sessionId
      ? `/chat/history?session_id=${sessionId}`
      : '/chat/history';
    return api.get<ChatMessage[]>(endpoint);
  },

  clearHistory: (sessionId: string) =>
    api.delete(`/chat/history/${sessionId}`),
};
