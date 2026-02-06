import { api } from './client';
import type { MetricDefinition, MetricGroup } from '../types';

export const metricsApi = {
  listDefinitions: async (): Promise<MetricDefinition[]> => api.get('/metrics/definitions'),
  createDefinition: async (data: Partial<MetricDefinition>): Promise<MetricDefinition> => api.post('/metrics/definitions', data),
  listGroups: async (): Promise<MetricGroup[]> => api.get('/metrics/groups'),
  createGroup: async (data: Partial<MetricGroup>): Promise<MetricGroup> => api.post('/metrics/groups', data),
  updateGroup: async (id: number, data: Partial<MetricGroup>): Promise<MetricGroup> => api.put(`/metrics/groups/${id}`, data),
  deleteGroup: async (id: number): Promise<void> => api.delete(`/metrics/groups/${id}`),
  addGroupMember: async (groupId: number, metric_key: string): Promise<void> =>
    api.post(`/metrics/groups/${groupId}/members`, { metric_key }),
};
