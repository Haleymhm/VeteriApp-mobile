export interface MedicalRecord {
  id: number;
  date: string;
  type: MedicalRecordType;
  description: string;
  diagnosis?: string | null;
  treatment?: string | null;
  vet?: MedicalRecordVetRef | null;
  appointmentId?: number | null;
  createdAt: string;
}

export type MedicalRecordType =
  | 'CHECKUP'
  | 'CONSULTATION'
  | 'SURGERY'
  | 'DENTAL'
  | 'LAB_TEST'
  | 'OTHER';

export interface MedicalRecordVetRef {
  id: number;
  firstName: string;
  lastName: string;
  specialty?: string | null;
}

export interface MedicalRecordListResponse {
  data: MedicalRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Vaccination {
  id: number;
  vaccineName: string;
  date: string;
  nextDueDate?: string | null;
  batchNumber?: string | null;
  veterinarian?: string | null;
  clinic?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface VaccinationListResponse {
  data: Vaccination[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DewormingType = 'INTERNAL' | 'EXTERNAL' | 'BOTH';

export interface Deworming {
  id: number;
  date: string;
  type: DewormingType;
  product?: string | null;
  dose?: string | null;
  veterinarian?: string | null;
  nextDueDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface DewormingListResponse {
  data: Deworming[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChronicCondition {
  id: number;
  condition: string;
  severity: ConditionSeverity;
  diagnosedDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConditionSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface ChronicConditionListResponse {
  data: ChronicCondition[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}