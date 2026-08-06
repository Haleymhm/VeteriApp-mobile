import { apiClient } from './client';
import { unwrap } from '@/lib/errors';
import type {
  ApiResponse,
  Profile,
  ProfileUpdateInput,
  PushRegistrationResponse,
  PushTokenPayload,
} from '@/types';

export async function getProfile(): Promise<Profile> {
  const { data } = await apiClient.get<ApiResponse<Profile>>('/profile');
  return unwrap(data);
}

export async function updateProfile(input: ProfileUpdateInput): Promise<Profile> {
  const { data } = await apiClient.put<ApiResponse<Profile>>('/profile', input);
  return unwrap(data);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const { data } = await apiClient.put<ApiResponse<null>>(
    '/profile/password',
    input,
  );
  if (!data.success) {
    throw new Error('error' in data ? data.error : 'No se pudo cambiar la contraseña');
  }
}

export async function registerPushToken(
  payload: PushTokenPayload,
): Promise<PushRegistrationResponse> {
  const { data } = await apiClient.put<ApiResponse<PushRegistrationResponse>>(
    '/profile/push-token',
    payload,
  );
  return unwrap(data);
}
