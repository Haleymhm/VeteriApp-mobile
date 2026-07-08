export interface PetOwner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export type Sex = 'MALE' | 'FEMALE';
export type ReproductiveStatus = 'FERTILE' | 'STERILIZED' | 'CASTRATED';

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  sex?: Sex | null;
  reproductiveStatus?: ReproductiveStatus | null;
  specialCharacteristics?: string | null;
  microchipNumber?: string | null;
  ownerId?: number;
  owner?: PetOwner;
  createdAt: string;
}

export interface PetsListResponse {
  data: Pet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PetCreateInput {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  sex?: Sex;
  reproductiveStatus?: ReproductiveStatus;
  specialCharacteristics?: string;
  microchipNumber?: string;
}

export interface PetUpdateInput {
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  sex?: Sex;
  reproductiveStatus?: ReproductiveStatus;
  specialCharacteristics?: string;
  microchipNumber?: string;
}
