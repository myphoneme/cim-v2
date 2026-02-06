import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { llmApi } from '../api/llm';

export function useLlmConfig(enabled = true) {
  return useQuery({
    queryKey: ['llm-config'],
    queryFn: () => llmApi.getConfig(),
    enabled,
  });
}

export function useAddLlmKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { provider: string; api_key: string; label?: string }) => llmApi.addKey(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['llm-config'] }),
  });
}

export function useSelectLlmKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: number) => llmApi.selectKey(keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['llm-config'] }),
  });
}

export function useDeleteLlmKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: number) => llmApi.deleteKey(keyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['llm-config'] }),
  });
}

export function useUpdateLlmKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: number; data: { api_key?: string; label?: string } }) =>
      llmApi.updateKey(keyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['llm-config'] }),
  });
}
