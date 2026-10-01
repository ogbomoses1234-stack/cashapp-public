import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

export function RoleGuard({ allow }: { allow: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) {
    return <Navigate to={user.role === 'staff' ? '/staff/denied' : '/home'} replace />;
  }
  return <Outlet />;
}
