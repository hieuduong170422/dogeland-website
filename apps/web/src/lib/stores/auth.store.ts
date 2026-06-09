'use client';

import { create } from 'zustand';
import { clearAccessToken, setAccessToken } from '@/lib/api/client';
import type { UserProfile } from '@/lib/api/auth.api';

interface AuthState {
  user: UserProfile | null;
  isLoaded: boolean;
  setAuth: (accessToken: string, user: UserProfile) => void;
  clearAuth: () => void;
  setLoaded: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,

  setAuth: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ user, isLoaded: true });
  },

  clearAuth: () => {
    clearAccessToken();
    set({ user: null, isLoaded: true });
  },

  setLoaded: () => set({ isLoaded: true }),
}));

export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.user !== null);
