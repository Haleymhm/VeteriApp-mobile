import { apiClient } from './client';
import { ApiRequestError } from '@/lib/errors';
import type {
  ApiResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
  SessionResponse,
} from '@/types';

export async function login(input: LoginInput): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<{ user: AuthUser }>>(
    '/auth/login',
    input,
  );
  if (!data.success) {
    const errorMessage =
      'error' in data && typeof data.error === 'string'
        ? data.error
        : 'No se pudo iniciar sesión';
    throw new ApiRequestError(errorMessage);
  }
  if (!data.data) {
    throw new ApiRequestError('No se pudo iniciar sesión');
  }
  return data.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/logout');
}

export async function getSession(): Promise<SessionResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<SessionResponse>>('/auth/session');
    if (!data.success || !data.data) return null;
    return data.data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/reset-password', {
    token,
    newPassword,
  });
}

export async function register(input: RegisterInput): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/register', input);
}
