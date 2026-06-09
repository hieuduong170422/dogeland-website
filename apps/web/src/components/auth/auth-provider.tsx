'use client';

import { useEffect } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';

/**
 * Silently refreshes access token on app mount using the httpOnly refresh cookie.
 * Must be rendered inside Providers.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoaded } = useAuthStore();

  useEffect(() => {
    let active = true;

    authApi
      .refresh()
      .then((res) => {
        if (!active) return;
        return authApi.me().then((profile) => {
          if (active) setAuth(res.accessToken, profile);
        });
      })
      .catch(() => {
        if (!active) return;
        // Only clear auth if no user was set in the meantime (e.g. by manual login)
        if (useAuthStore.getState().user) {
          setLoaded();
        } else {
          clearAuth();
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return <>{children}</>;
}
