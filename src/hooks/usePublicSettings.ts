import { useQuery } from '@tanstack/react-query';
import * as publicApi from '@/api/public';
import type { AppointmentCategory } from '@/types';

export function usePublicSettings() {
  return useQuery({
    queryKey: ['public', 'settings'],
    queryFn: () => publicApi.getPublicSettings(),
    staleTime: 1000 * 60 * 60,
  });
}

export function useCategories() {
  return useQuery<AppointmentCategory[]>({
    queryKey: ['categories'],
    queryFn: () => publicApi.getCategories(),
    staleTime: 1000 * 60 * 60,
  });
}
