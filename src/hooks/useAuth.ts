import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/services/auth.service';
import { setUnauthorizedHandler } from '@/services/api';

/**
 * Bootstraps auth once on app load:
 *  - Calls GET /api/public/auth/me
 *  - Populates the store or clears on 401
 *  - Registers a global 401 handler that resets state
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    let cancelled = false;

    setUnauthorizedHandler(() => clear());

    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, setHydrated, clear]);
}

export function useAuth() {
  return useAuthStore();
}
