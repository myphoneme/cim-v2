import { api } from './client';
import type { MonitoringUpload } from '../types';

export const monitoringApi = {
  list: async (params?: { device_item_id?: number; vm_id?: number }): Promise<MonitoringUpload[]> => {
    const searchParams = new URLSearchParams();
    if (params?.device_item_id) searchParams.append('device_item_id', params.device_item_id.toString());
    if (params?.vm_id) searchParams.append('vm_id', params.vm_id.toString());
    const queryString = searchParams.toString();
    return api.get(`/monitoring-uploads/${queryString ? `?${queryString}` : ''}`);
  },
  get: async (id: number): Promise<MonitoringUpload> => api.get(`/monitoring-uploads/${id}`),
  upload: async (formData: FormData): Promise<MonitoringUpload> => api.upload('/monitoring-uploads/', formData),
  confirm: async (id: number, data: { metrics?: MonitoringUpload['extracted_metrics']; capture_time?: string }): Promise<{
    message: string;
    created: number;
    skipped_unmapped: Array<{ ip_address?: string; key?: string }>;
    skipped_missing_key: number;
  }> =>
    api.post(`/monitoring-uploads/${id}/confirm`, data),
};
