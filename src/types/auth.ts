export type Role = 'ADMIN' | 'VET' | 'RECEPTIONIST' | 'CLIENT';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface SessionResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
