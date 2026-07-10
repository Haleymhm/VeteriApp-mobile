import { apiClient } from './client';
import { unwrap } from '@/lib/errors';
import type {
  ApiResponse,
  MedicalRecordListResponse,
  VaccinationListResponse,
  DewormingListResponse,
  ChronicConditionListResponse,
} from '@/types';

interface GetMedicalRecordsParams {
  petId: number;
  page?: number;
  limit?: number;
}

export async function getMedicalRecords(
  params: GetMedicalRecordsParams,
): Promise<MedicalRecordListResponse> {
  const { data } = await apiClient.get<ApiResponse<MedicalRecordListResponse>>(
    '/medical-records',
    { params },
  );
  return unwrap(data);
}

export async function getVaccinations(petId: number): Promise<VaccinationListResponse> {
  const { data } = await apiClient.get<ApiResponse<VaccinationListResponse>>(
    `/pets/${petId}/vaccinations`,
  );
  return unwrap(data);
}

export async function getDeworming(petId: number): Promise<DewormingListResponse> {
  const { data } = await apiClient.get<ApiResponse<DewormingListResponse>>(
    `/pets/${petId}/deworming`,
  );
  return unwrap(data);
}

export async function getChronicConditions(
  petId: number,
): Promise<ChronicConditionListResponse> {
  const { data } = await apiClient.get<ApiResponse<ChronicConditionListResponse>>(
    `/pets/${petId}/chronic-conditions`,
  );
  return unwrap(data);
}