import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-ink-900">
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-8 pt-12">
        <Outlet />
      </main>
    </div>
  );
}
