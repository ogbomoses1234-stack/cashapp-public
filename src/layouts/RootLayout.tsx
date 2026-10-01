import { Outlet } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { ToastHost } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { RouteProgress } from '@/components/ui/RouteProgress';

export function RootLayout() {
  return (
    <ErrorBoundary>
      {/* Slim bar at the very top during route changes */}
      <RouteProgress />

      <Outlet />
      <AuthModal />
      <ToastHost />
    </ErrorBoundary>
  );
}
