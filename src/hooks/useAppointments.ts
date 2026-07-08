import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as apptsApi from '@/api/appointments';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '@/types';

interface UseAppointmentsParams {
  status?: AppointmentStatus;
  pendingOnly?: boolean;
}

export function useAppointments(params: UseAppointmentsParams = {}) {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', params],
    queryFn: () => apptsApi.getAppointments(params),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, CreateAppointmentInput>({
    mutationFn: (input) => apptsApi.createAppointment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment(id: number) {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, UpdateAppointmentInput>({
    mutationFn: (input) => apptsApi.updateAppointment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
