import { Outlet } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { ToastHost } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { RouteProgress } from '@/components/ui/RouteProgress';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouteProgress />

      <Outlet />
      <AuthModal />
      <ToastHost />
    </ErrorBoundary>
  );
}