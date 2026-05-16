import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/enums';
import { canAccessNav, type NavKey } from '@/utils/permissions';

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role) ?? null;

  const hasRole = useCallback(
    (...roles: UserRole[]) => (role ? roles.includes(role) : false),
    [role],
  );

  const canAccess = useCallback(
    (key: NavKey) => (role ? canAccessNav(role, key) : false),
    [role],
  );

  return { role, hasRole, canAccess };
}
