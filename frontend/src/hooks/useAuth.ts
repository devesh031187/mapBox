import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.logout);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authService.login(email, password);
      setAuth(data.user, data.access_token);
      return data.user;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout; clear local state regardless
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return { user, isAuthenticated, login, logout };
}
