import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-4xl">
        404
      </div>
      <h1 className="mb-2 text-2xl font-black tracking-tight text-ink-900">Page not found</h1>
      <p className="mb-6 max-w-xs text-sm font-medium text-slate-500">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
