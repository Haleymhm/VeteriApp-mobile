import type { ApiResponse } from '@/types';

export class ApiRequestError extends Error {
  readonly status: number | null;
  readonly payload: unknown;

  constructor(message: string, status: number | null = null, payload: unknown = null) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.payload = payload;
  }
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiRequestError(response.error ?? 'Error de la API');
  }
  return response.data;
}

export function getErrorMessage(error: unknown, fallback = 'Algo salió mal'): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
