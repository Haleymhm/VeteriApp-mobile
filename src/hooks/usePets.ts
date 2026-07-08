import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as petsApi from '@/api/pets';
import type {
  Pet,
  PetCreateInput,
  PetUpdateInput,
  PetsListResponse,
} from '@/types';

const petsKey = (params: { page?: number; limit?: number }) =>
  ['pets', params] as const;

export function usePets(params: { page?: number; limit?: number } = {}) {
  return useQuery<PetsListResponse>({
    queryKey: petsKey(params),
    queryFn: () => petsApi.getPets(params),
  });
}

export function usePet(id: number) {
  return useQuery<Pet>({
    queryKey: ['pet', id],
    queryFn: () => petsApi.getPet(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreatePet() {
  const qc = useQueryClient();
  return useMutation<Pet, Error, PetCreateInput>({
    mutationFn: (input) => petsApi.createPet(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUpdatePet(id: number) {
  const qc = useQueryClient();
  return useMutation<Pet, Error, PetUpdateInput>({
    mutationFn: (input) => petsApi.updatePet(id, input),
    onSuccess: (data) => {
      qc.setQueryData(['pet', id], data);
      qc.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}
