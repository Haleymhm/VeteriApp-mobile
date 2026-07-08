export interface Region {
  id: string;
  name: string;
  code: string;
}

export interface Comuna {
  id: string;
  name: string;
  code: string;
  regionId: string;
}

export interface Profile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  rut?: string | null;
  phone?: string | null;
  address?: string | null;
  regionId?: string | null;
  comunaId?: string | null;
  createdAt: string;
  updatedAt: string;
  region?: Region | null;
  comuna?: Comuna | null;
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  regionId?: string;
  comunaId?: string;
}
