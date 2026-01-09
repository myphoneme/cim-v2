import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi, type EquipmentCreateInput, type ManualContentInput } from '../api/equipment';

export const useEquipment = () => {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentApi.getAll,
  });
};

export const useEquipmentById = (id: number) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getById(id),
    enabled: !!id,
  });
};

// Alias for AdminPanel usage
export const useEquipmentDetails = useEquipmentById;

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipmentCreateInput) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EquipmentCreateInput> }) =>
      equipmentApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useSaveManual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      equipmentId,
      manual,
    }: {
      equipmentId: number;
      manual: ManualContentInput;
    }) => equipmentApi.saveManual(equipmentId, manual),
    onSuccess: (_, { equipmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useGenerateManual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipmentId: number) => equipmentApi.generateManual(equipmentId),
    onSuccess: (_, equipmentId) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};
