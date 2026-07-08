import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { ApiRequestError } from '@/lib/errors';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { getSecureItem } from '@/lib/storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function readToken(): Promise<string | null> {
  return getSecureItem(STORAGE_KEYS.authToken);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await readToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      const message =
        error.response.data?.error ??
        error.response.data?.message ??
        `Error ${error.response.status}`;
      return Promise.reject(new ApiRequestError(message, error.response.status, error.response.data));
    }
    if (error.request) {
      return Promise.reject(
        new ApiRequestError('Sin conexión con el servidor', null, error.request),
      );
    }
    return Promise.reject(new ApiRequestError(error.message));
  },
);

export { API_URL };
