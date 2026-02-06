import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vmsApi } from '../api/vms';
import type { VmItem } from '../types';

export function useVmItems() {
  return useQuery({
    queryKey: ['vm-items'],
    queryFn: vmsApi.list,
  });
}

export function useCreateVmItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VmItem>) => vmsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vm-items'] }),
  });
}

export function useUpdateVmItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VmItem> }) => vmsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vm-items'] }),
  });
}

export function useDeleteVmItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vmsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vm-items'] }),
  });
}
