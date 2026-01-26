import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useAnnexBatches(annexType, heiId) {
  return useQuery({
    queryKey: ['annex-batches', annexType, heiId],
    queryFn: async () => {
      const { data } = await axios.get(`/hei/annex-${annexType}/history`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!annexType && !!heiId,
  });
}

export function useCreateAnnexSubmission(annexType) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post(`/hei/annex-${annexType}/store`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['annex-batches', annexType] });
    },
  });
}
