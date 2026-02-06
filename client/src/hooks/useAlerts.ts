import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.list,
  });
}

export function useAlertRules() {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: alertsApi.listRules,
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => alertsApi.createRule(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-rules'] }),
  });
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => alertsApi.updateRule(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-rules'] }),
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.deleteRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alert-rules'] }),
  });
}

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note?: string }) =>
      alertsApi.addUpdate(id, { status, note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useAssignAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, team_id, user_id }: { id: number; team_id?: number; user_id?: number }) =>
      alertsApi.assign(id, { team_id, user_id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
