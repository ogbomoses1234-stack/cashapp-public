import { ReactNode } from 'react';

type Tone = 'green' | 'amber' | 'blue' | 'rose' | 'slate' | 'violet';

const tones: Record<Tone, string> = {
  green:  'bg-brand-50    text-brand-700   ring-brand-200',
  amber:  'bg-amber-50    text-amber-700   ring-amber-200',
  blue:   'bg-sky-50      text-sky-700     ring-sky-200',
  rose:   'bg-rose-50     text-rose-700    ring-rose-200',
  slate:  'bg-ink-100     text-ink-600     ring-ink-200',
  violet: 'bg-violet-50   text-violet-700  ring-violet-200',
};

export function Badge({
  tone = 'slate',
  children,
  className = '',
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 whitespace-nowrap
        rounded-md px-2 py-0.5
        text-[11px] font-semibold tracking-[-0.005em]
        ring-1 ring-inset
        ${tones[tone]} ${className}
      `}
    >
      {children}
    </span>
  );
}