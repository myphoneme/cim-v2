import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringApi } from '../api/monitoring';

export function useMonitoringUploads(params?: { device_item_id?: number; vm_id?: number }) {
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
        if (!Array.isArray(old)) return old;
        if (old.some((upload) => upload.id === created.id)) {
          return old;
        }
        return [created, ...old];
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
