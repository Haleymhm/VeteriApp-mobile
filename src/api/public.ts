import { apiClient } from './client';
import { unwrap } from '@/lib/errors';
import type { ApiResponse, AppointmentCategory } from '@/types';

interface PublicSettingsDay {
  enabled: boolean;
  open: string;
  close: string;
}

export interface PublicSettingsResponse {
  schedule: Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    PublicSettingsDay
  >;
  upcomingHolidays: {
    id: number;
    date: string;
    label: string;
  }[];
}

export async function getPublicSettings(): Promise<PublicSettingsResponse> {
  const { data } = await apiClient.get<ApiResponse<PublicSettingsResponse>>(
    '/public/settings',
  );
  return unwrap(data);
}

export async function getCategories(): Promise<AppointmentCategory[]> {
  const { data } = await apiClient.get<ApiResponse<AppointmentCategory[]>>(
    '/categories',
  );
  return unwrap(data);
}
