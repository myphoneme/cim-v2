import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics';
import type { MetricDefinition, MetricGroup } from '../types';

export function useMetricDefinitions() {
  return useQuery({
    queryKey: ['metric-definitions'],
    queryFn: metricsApi.listDefinitions,
  });
}

export function useCreateMetricDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MetricDefinition>) => metricsApi.createDefinition(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metric-definitions'] }),
  });
}

export function useMetricGroups() {
  return useQuery({
    queryKey: ['metric-groups'],
    queryFn: metricsApi.listGroups,
  });
}

export function useCreateMetricGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MetricGroup>) => metricsApi.createGroup(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metric-groups'] }),
  });
}

export function useUpdateMetricGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MetricGroup> }) => metricsApi.updateGroup(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metric-groups'] }),
  });
}

export function useDeleteMetricGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => metricsApi.deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metric-groups'] }),
  });
}

export function useAddMetricGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, metric_key }: { groupId: number; metric_key: string }) =>
      metricsApi.addGroupMember(groupId, metric_key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metric-groups'] }),
  });
}
