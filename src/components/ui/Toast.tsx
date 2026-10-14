import { useToasts } from '@/hooks/useToast';

const styles = {
  success: 'border-brand-200  bg-white  text-ink-900',
  error:   'border-rose-200   bg-white  text-ink-900',
  info:    'border-sky-200    bg-white  text-ink-900',
};

const icons = {
  success: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-11" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" />
    </svg>
  ),
};

export function ToastHost() {
  const toasts = useToasts();

  return (
    <div
      className="
        pointer-events-none fixed z-[200] flex flex-col items-center gap-2
        bottom-20 left-1/2 -translate-x-1/2 px-4
        sm:bottom-auto sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0 sm:items-end
      "
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto
            flex max-w-[calc(100vw-32px)] items-start gap-2.5
            animate-fade-up
            rounded-lg border px-3.5 py-2.5
            shadow-md shadow-ink-950/5
            ${styles[t.kind]}
          `}
          role="status"
        >
          <span className="mt-[1px] flex-shrink-0">{icons[t.kind]}</span>
          <span className="text-[13px] font-medium leading-snug tracking-[-0.005em]">
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}