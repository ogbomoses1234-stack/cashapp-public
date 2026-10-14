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
    <div className="flex flex-col items-center justify-center rounded-xl bg-white px-6 py-14 text-center ring-1 ring-ink-200/70">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-ink-50 text-2xl ring-1 ring-ink-100">
        {icon}
      </span>
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
        {title}
      </h3>
      {hint && (
        <p className="mt-1.5 max-w-xs text-[13px] font-medium leading-relaxed text-ink-500">
          {hint}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}