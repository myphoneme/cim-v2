import { api } from './client';
import type { VmItem } from '../types';

export const vmsApi = {
  list: async (): Promise<VmItem[]> => api.get('/vm-items'),
  get: async (id: number): Promise<VmItem> => api.get(`/vm-items/${id}`),
  create: async (data: Partial<VmItem>): Promise<VmItem> => api.post('/vm-items', data),
  update: async (id: number, data: Partial<VmItem>): Promise<VmItem> => api.put(`/vm-items/${id}`, data),
  delete: async (id: number): Promise<void> => api.delete(`/vm-items/${id}`),
};
