import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useDashboardData(academicYear) {
  return useQuery({
    queryKey: ['dashboard', academicYear],
    queryFn: async () => {
      const { data } = await axios.get('/hei/dashboard', {
        params: { year: academicYear }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend)
    enabled: !!academicYear,
  });
}

export function useDashboardChecklist(academicYear) {
  return useQuery({
    queryKey: ['dashboard-checklist', academicYear],
    queryFn: async () => {
      const { data } = await axios.get('/hei/dashboard/checklist', {
        params: { year: academicYear }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!academicYear,
  });
}

export function useDashboardActivities(academicYear) {
  return useQuery({
    queryKey: ['dashboard-activities', academicYear],
    queryFn: async () => {
      const { data } = await axios.get('/hei/dashboard/activities', {
        params: { year: academicYear }
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!academicYear,
  });
}
