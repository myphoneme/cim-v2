import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringApi } from '../api/monitoring';

export function useMonitoringUploads(params?: { device_item_id?: number; vm_id?: number; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['monitoring-uploads', params],
    queryFn: () => monitoringApi.list(params),
  });
}

export function useUploadMonitoring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => monitoringApi.upload(formData),
    onSuccess: (created) => {
      queryClient.setQueriesData({ queryKey: ['monitoring-uploads'] }, (old) => {
        if (!old || typeof old !== 'object' || !('items' in old)) return old;
        const existing = (old as any).items as any[];
        if (!Array.isArray(existing)) return old;
        if (existing.some((upload) => upload.id === created.id)) {
          return old;
        }
        return { ...old, items: [created, ...existing] };
      });
      queryClient.invalidateQueries({ queryKey: ['monitoring-uploads'] });
    },
  });
}

export function useMonitoringUpload(id?: number) {
  return useQuery({
    queryKey: ['monitoring-uploads', id],
    queryFn: () => (id ? monitoringApi.get(id) : Promise.reject()),
    enabled: Boolean(id),
  });
}

export function useConfirmMonitoringUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { metrics?: any[]; capture_time?: string } }) =>
      monitoringApi.confirm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-uploads'] });
    },
  });
}
