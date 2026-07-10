import { useQuery } from '@tanstack/react-query';
import * as medicalRecordsApi from '@/api/medicalRecords';
import type {
  MedicalRecordListResponse,
  VaccinationListResponse,
  DewormingListResponse,
  ChronicConditionListResponse,
} from '@/types';

export function useMedicalRecords(petId: number, params: { page?: number; limit?: number } = {}) {
  return useQuery<MedicalRecordListResponse>({
    queryKey: ['medical-records', petId, params],
    queryFn: () => medicalRecordsApi.getMedicalRecords({ petId, ...params }),
    enabled: Number.isFinite(petId) && petId > 0,
  });
}

export function useVaccinations(petId: number) {
  return useQuery<VaccinationListResponse>({
    queryKey: ['vaccinations', petId],
    queryFn: () => medicalRecordsApi.getVaccinations(petId),
    enabled: Number.isFinite(petId) && petId > 0,
  });
}

export function useDeworming(petId: number) {
  return useQuery<DewormingListResponse>({
    queryKey: ['deworming', petId],
    queryFn: () => medicalRecordsApi.getDeworming(petId),
    enabled: Number.isFinite(petId) && petId > 0,
  });
}

export function useChronicConditions(petId: number) {
  return useQuery<ChronicConditionListResponse>({
    queryKey: ['chronic-conditions', petId],
    queryFn: () => medicalRecordsApi.getChronicConditions(petId),
    enabled: Number.isFinite(petId) && petId > 0,
  });
}