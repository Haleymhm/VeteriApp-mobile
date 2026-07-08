import { apiClient } from './client';
import { unwrap } from '@/lib/errors';
import type {
  ApiResponse,
  Pet,
  PetCreateInput,
  PetUpdateInput,
  PetsListResponse,
} from '@/types';

interface GetPetsParams {
  page?: number;
  limit?: number;
}

export async function getPets(params: GetPetsParams = {}): Promise<PetsListResponse> {
  const { data } = await apiClient.get<ApiResponse<PetsListResponse>>('/pets', {
    params,
  });
  return unwrap(data);
}

export async function getPet(id: number): Promise<Pet> {
  const { data } = await apiClient.get<ApiResponse<Pet>>(`/pets/${id}`);
  return unwrap(data);
}

export async function createPet(input: PetCreateInput): Promise<Pet> {
  const { data } = await apiClient.post<ApiResponse<Pet>>('/pets', input);
  return unwrap(data);
}

export async function updatePet(id: number, input: PetUpdateInput): Promise<Pet> {
  const { data } = await apiClient.put<ApiResponse<Pet>>(`/pets/${id}`, input);
  return unwrap(data);
}
