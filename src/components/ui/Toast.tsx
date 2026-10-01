import { useToasts } from '@/hooks/useToast';

const styles = {
  success: 'border-brand-400/40 text-brand-200',
  error: 'border-rose-400/40 text-rose-200',
  info: 'border-sky-400/40 text-sky-200',
};

const icons = { success: '✓', error: '✕', info: 'ℹ' };

export function ToastHost() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up rounded-2xl border bg-ink-800/95 px-5 py-3 text-sm font-bold shadow-xl backdrop-blur ${styles[t.kind]}`}
        >
          <span className="mr-2">{icons[t.kind]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
