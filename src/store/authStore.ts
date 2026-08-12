import { create } from 'zustand';
import type { AuthUser } from '@/types';
import { getSecureItem, deleteSecureItem, setSecureItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import * as authApi from '@/api/auth';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  status: 'idle',
  error: null,

  async hydrate() {
    if (get().status === 'authenticated' || get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const [storedToken, storedUser] = await Promise.all([
        getSecureItem(STORAGE_KEYS.authToken),
        getSecureItem(STORAGE_KEYS.authUser),
      ]);
      const parsedUser = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
      if (storedToken && storedToken !== 'cookie' && parsedUser) {
        set({ token: storedToken, user: parsedUser, status: 'authenticated', error: null });
        return;
      }
      if (!storedToken || storedToken === 'cookie') {
        await Promise.all([
          deleteSecureItem(STORAGE_KEYS.authToken),
          deleteSecureItem(STORAGE_KEYS.authUser),
        ]);
        set({ status: 'unauthenticated' });
        return;
      }
      const session = await authApi.getSession();
      if (session) {
        const user: AuthUser = {
          id: session.userId,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          role: session.role,
        };
        set({ user, token: storedToken, status: 'authenticated', error: null });
        await setSecureItem(STORAGE_KEYS.authUser, JSON.stringify(user));
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  async login(email, password) {
    set({ status: 'loading', error: null });
    try {
      const res = await authApi.login({ email, password });
      const authToken = res.token || 'cookie';
      await setSecureItem(STORAGE_KEYS.authToken, authToken);
      await setSecureItem(STORAGE_KEYS.authUser, JSON.stringify(res.user));
      set({ user: res.user, token: authToken, status: 'authenticated', error: null });
      return res.user;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo iniciar sesión';
      set({ status: 'unauthenticated', error: message });
      throw error;
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } catch {
      // Ignorar errores de red en logout: igual limpiamos estado local.
    }
    await Promise.all([
      deleteSecureItem(STORAGE_KEYS.authToken),
      deleteSecureItem(STORAGE_KEYS.authUser),
      deleteSecureItem(STORAGE_KEYS.pushToken),
    ]);
    set({ user: null, token: null, status: 'unauthenticated', error: null });
  },

  async refreshSession() {
    try {
      const session = await authApi.getSession();
      if (!session) {
        await get().logout();
        return;
      }
      const user: AuthUser = {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        role: session.role,
      };
      set({ user, status: 'authenticated' });
      await setSecureItem(STORAGE_KEYS.authUser, JSON.stringify(user));
    } catch {
      // Silencioso: que la UI decida reintentar.
    }
  },

  clearError() {
    set({ error: null });
  },
}));
