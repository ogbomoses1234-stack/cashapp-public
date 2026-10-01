import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Redirects staff to /staff/change-password if they still have
 * a temporary password (mustChangePassword = true).
 *
 * Passes through otherwise, including for:
 *   - Customers (this guard only wraps staff routes)
 *   - Staff who've already set their own password
 *   - Unauthenticated users (they'll be handled by ProtectedRoute above)
 */
export function MustChangePasswordGuard() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const mustChange = Boolean(
    (user as unknown as { mustChangePassword?: boolean })?.mustChangePassword
  );

  /* If they must change and aren't already on the change page → redirect */
  if (mustChange && location.pathname !== '/staff/change-password') {
    return <Navigate to="/staff/change-password" replace />;
  }

  return <Outlet />;
}
