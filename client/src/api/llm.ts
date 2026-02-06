import { api } from './client';
import type { LlmConfigResponse } from '../types';

export const llmApi = {
  getConfig: async (): Promise<LlmConfigResponse> => api.get('/llm-config/'),
  addKey: async (data: { provider: string; api_key: string; label?: string }): Promise<LlmConfigResponse> =>
    api.post('/llm-config/keys', data),
  selectKey: async (keyId: number): Promise<LlmConfigResponse> =>
    api.patch('/llm-config/select', { key_id: keyId }),
  updateKey: async (keyId: number, data: { api_key?: string; label?: string }): Promise<LlmConfigResponse> =>
    api.patch(`/llm-config/keys/${keyId}`, data),
  deleteKey: async (keyId: number): Promise<LlmConfigResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/llm-config/keys/${keyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
