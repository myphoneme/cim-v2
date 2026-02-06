import { api } from './client';
import type { Alert, AlertRule } from '../types';

export const alertsApi = {
  list: async (): Promise<Alert[]> => api.get('/alerts'),
  get: async (id: number): Promise<Alert> => api.get(`/alerts/${id}`),
  listRules: async (): Promise<AlertRule[]> => api.get('/alerts/rules'),
  createRule: async (data: Partial<AlertRule>): Promise<AlertRule> => api.post('/alerts/rules', data),
  updateRule: async (id: number, data: Partial<AlertRule>): Promise<AlertRule> => api.put(`/alerts/rules/${id}`, data),
  deleteRule: async (id: number): Promise<void> => api.delete(`/alerts/rules/${id}`),
  addUpdate: async (id: number, data: { status: string; note?: string }): Promise<void> => api.post(`/alerts/${id}/updates`, data),
  assign: async (id: number, data: { team_id?: number; user_id?: number }): Promise<void> => api.post(`/alerts/${id}/assign`, data),
};
