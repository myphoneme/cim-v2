import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi, deviceItemsApi } from '../api/assets';
import type { Location, DeviceItem, DeviceCategory } from '../types';

// Location hooks
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.list,
  });
}

export function useLocation(id: number) {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => locationsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Location>) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Location> }) =>
      locationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

// Device Item hooks
export function useDeviceItems(params?: {
  category?: DeviceCategory;
  location_id?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['device-items', params],
    queryFn: () => deviceItemsApi.list(params),
  });
}

export function useDeviceItem(id: number) {
  return useQuery({
    queryKey: ['device-items', id],
    queryFn: () => deviceItemsApi.get(id),
    enabled: !!id,
  });
}

export function useDeviceCategories() {
  return useQuery({
    queryKey: ['device-categories'],
    queryFn: deviceItemsApi.getCategories,
  });
}

export function useCreateDeviceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DeviceItem>) => deviceItemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-items'] });
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
    },
  });
}

export function useCreateDeviceItemsBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: Partial<DeviceItem>[]) => deviceItemsApi.createBulk(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-items'] });
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
    },
  });
}

export function useUpdateDeviceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeviceItem> }) =>
      deviceItemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-items'] });
    },
  });
}

export function useDeleteDeviceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deviceItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-items'] });
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
    },
  });
}
