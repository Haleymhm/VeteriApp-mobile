import { useAuthStore } from '@/store/authStore';
import * as authApi from '@/api/auth';
import { getErrorMessage } from '@/lib/errors';
import type { AuthUser } from '@/types';

interface UseAuth {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuth {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const loginStore = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const clearError = useAuthStore((s) => s.clearError);

  async function login(email: string, password: string): Promise<AuthUser> {
    try {
      return await loginStore(email, password);
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  }

  async function logout(): Promise<void> {
    await logoutStore();
  }

  return {
    user,
    status,
    error,
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    refreshSession,
    clearError,
  };
}

export { authApi };
