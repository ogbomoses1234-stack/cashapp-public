import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh: () => Promise<unknown> | unknown;
  label?: string;
  size?: number;
  tone?: 'light' | 'dark';
  className?: string;
}

export function RefreshButton({
  onRefresh,
  label = 'Refresh',
  size = 16,
  tone = 'light',
  className = '',
}: RefreshButtonProps) {
  const [busy, setBusy] = useState(false);
  const [justFinished, setJustFinished] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onRefresh();
      setJustFinished(true);
      setTimeout(() => setJustFinished(false), 900);
    } finally {
      setBusy(false);
    }
  };

  const isLight = tone === 'light';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className={`
        relative grid h-9 w-9 place-items-center rounded-lg
        transition-colors duration-150 active:scale-95
        disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
        ${
          isLight
            ? 'bg-white text-ink-600 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink-900'
            : 'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15'
        }
        ${className}
      `}
    >
      {justFinished && (
        <span
          className={`pointer-events-none absolute inset-0 rounded-lg ring-pulse ${
            isLight ? 'text-brand-500' : 'text-brand-400'
          }`}
          style={{ inset: '-2px' }}
        />
      )}

      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={busy ? 'animate-rotate-refresh' : ''}
        style={{ transition: 'transform 0.2s ease' }}
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}