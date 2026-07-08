import { apiClient } from './client';
import { unwrap } from '@/lib/errors';
import type {
  ApiResponse,
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/types';

interface GetAppointmentsParams {
  status?: AppointmentStatus;
  petId?: number;
  dateFrom?: string;
  dateTo?: string;
  pendingOnly?: boolean;
}

export async function getAppointments(
  params: GetAppointmentsParams = {},
): Promise<Appointment[]> {
  const { data } = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', {
    params,
  });
  return unwrap(data);
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    '/appointments',
    input,
  );
  return unwrap(data);
}

export async function updateAppointment(
  id: number,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const { data } = await apiClient.put<ApiResponse<Appointment>>(
    `/appointments/${id}`,
    input,
  );
  return unwrap(data);
}
