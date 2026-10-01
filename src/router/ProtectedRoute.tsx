import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.emailVerified) {
    return (
      <Navigate
        to={`/verify-otp?email=${encodeURIComponent(user.email)}`}
        replace
      />
    );
  }

  /* ═══════════════════════════════════════════════════════
     ONLY customers go through the profile-setup wall.
     Staff / admins / unknown roles pass straight through.
  ═══════════════════════════════════════════════════════ */
  if (user.role === 'customer') {
    const profileComplete =
      Boolean(user.fullName) &&
      Boolean(user.phoneNumber) &&
      Boolean(user.deliveryAddress);

    const onProfileSetup = location.pathname === '/profile-setup';

    if (!profileComplete && !onProfileSetup) {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return <Outlet />;
}
