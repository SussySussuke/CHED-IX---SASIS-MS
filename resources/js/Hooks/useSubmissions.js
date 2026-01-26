import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useSubmissions() {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const { data } = await axios.get('/hei/submissions');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBatchDetails(annexType, batchId) {
  return useQuery({
    queryKey: ['batch', annexType, batchId],
    queryFn: async () => {
      const { data } = await axios.get(`/hei/annex-${annexType}/batch/${batchId}`);
      return data;
    },
    enabled: !!batchId,
    staleTime: 30 * 60 * 1000, // 30 minutes (matches backend)
  });
}

export function useCancelSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ batchId, notes }) => {
      const { data } = await axios.post(`/hei/submissions/cancel/${batchId}`, {
        cancelled_notes: notes,
      });
      return data;
    },
    onMutate: async ({ batchId }) => {
      await queryClient.cancelQueries({ queryKey: ['submissions'] });
      const previousSubmissions = queryClient.getQueryData(['submissions']);

      queryClient.setQueryData(['submissions'], (old) => {
        if (!old) return old;
        return old.map(submission => 
          submission.batch_id === batchId 
            ? { ...submission, status: 'cancelled' }
            : submission
        );
      });

      return { previousSubmissions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSubmissions) {
        queryClient.setQueryData(['submissions'], context.previousSubmissions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data } = await axios.get('/hei/academic-years');
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
