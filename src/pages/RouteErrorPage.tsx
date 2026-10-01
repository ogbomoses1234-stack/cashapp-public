import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface RouteError {
  message?: string;
  statusText?: string;
}

export default function RouteErrorPage() {
  const error = useRouteError() as RouteError | undefined;
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-rose-100 text-3xl">
        💥
      </div>
      <h1 className="mb-2 text-2xl font-black tracking-tight text-ink-900">
        Something went wrong
      </h1>
      <p className="mb-6 max-w-sm text-[13px] font-medium text-slate-500">
        {error?.message ?? error?.statusText ?? 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-3">
        <Button variant="primary" size="lg" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/')}>
          Go home
        </Button>
      </div>
    </div>
  );
}
