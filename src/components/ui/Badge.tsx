import { ReactNode } from 'react';

type Tone = 'green' | 'amber' | 'blue' | 'rose' | 'slate' | 'violet';

const tones: Record<Tone, string> = {
  green: 'bg-brand-500/15 text-brand-700',
  amber: 'bg-amber-500/15 text-amber-700',
  blue: 'bg-sky-500/15 text-sky-700',
  rose: 'bg-rose-500/15 text-rose-700',
  slate: 'bg-slate-500/15 text-slate-700',
  violet: 'bg-violet-500/15 text-violet-700',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10.5px] font-extrabold ${tones[tone]}`}>
      {children}
    </span>
  );
}
