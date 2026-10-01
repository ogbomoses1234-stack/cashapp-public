import { ReactNode } from 'react';

export function EmptyState({
  icon = '📭',
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-14 text-center shadow-card">
      <span className="mb-3 text-5xl">{icon}</span>
      <h3 className="text-base font-extrabold text-ink-900">{title}</h3>
      {hint && <p className="mt-1 max-w-xs text-xs font-semibold text-slate-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
