export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentCategory {
  id: string;
  name: string;
  color: string;
}

export interface AppointmentPetRef {
  id: number;
  name: string;
  species: string;
}

export interface AppointmentVetRef {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Appointment {
  id: number;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
  petId: number;
  pet?: AppointmentPetRef;
  category?: AppointmentCategory;
  vet?: AppointmentVetRef | null;
  createdAt: string;
}

export interface CreateAppointmentInput {
  petId: number;
  categoryId: string;
  date: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  notes?: string;
}
