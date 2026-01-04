import { create } from 'zustand';
import type { User } from '@/shared/types/auth';
import type { LoginDto } from '@/shared/types/auth';
import { authApi } from '@/shared/api/auth';
import { setAuthClearCallback } from '@/shared/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMustChangePassword: () => void;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const clearUser = () => set({ user: null, isAuthenticated: false });

  setAuthClearCallback(clearUser);

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),

    clearUser,

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    clearMustChangePassword: () =>
      set((state) => ({
        user: state.user ? { ...state.user, mustChangePassword: false } : null,
      })),

    login: async (credentials: LoginDto) => {
      try {
        set({ isLoading: true, error: null });
        const result = await authApi.login(credentials);
        const user: User = {
          userId: result.userId,
          username: result.username,
          fullName: result.fullName,
          globalRole: result.globalRole,
          mustChangePassword: result.mustChangePassword,
        };
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.title || 'Login failed';
        set({ error: errorMessage, isLoading: false, user: null, isAuthenticated: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true });
        await authApi.logout();
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      } catch (error: any) {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    },

    checkAuth: async () => {
      try {
        set({ isLoading: true, error: null });
        const result = await authApi.getCurrentUser();
        const user: User = {
          userId: result.userId,
          username: result.username,
          fullName: result.fullName,
          globalRole: result.globalRole,
          mustChangePassword: result.mustChangePassword,
        };
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error: any) {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      }
    },
  };
});
