import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'brand' | 'outline' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   Variant rules
   ─ primary  · dark ink, main action (Submit, Confirm, Continue)
   ─ brand    · green, money/success actions (Buy, Withdraw, Scan)
   ─ outline  · white surface, secondary actions (Cancel, Back)
   ─ ghost    · transparent, tertiary actions (Skip, Dismiss)
   ─ dark     · for use on dark backgrounds (Scanner overlays)
   ─ danger   · destructive with a soft rose tint
═══════════════════════════════════════════════════════════ */
const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  brand:
    'bg-brand-500 text-ink-950 hover:bg-brand-600 active:bg-brand-700',
  outline:
    'bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  dark:
    'bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/15',
  danger:
    'bg-rose-500/10 text-rose-600 hover:bg-rose-500/15',
};

const sizes: Record<Size, string> = {
  sm: 'h-9  px-3.5 text-[13px]   rounded-lg gap-1.5',
  md: 'h-10 px-4   text-[13.5px] rounded-lg gap-2',
  lg: 'h-12 px-5   text-[14.5px] rounded-lg gap-2',
};

const spinnerTone: Record<Variant, 'light' | 'dark' | 'brand'> = {
  primary: 'light',
  brand:   'dark',
  outline: 'dark',
  ghost:   'dark',
  dark:    'light',
  danger:  'dark',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block,
    loading,
    className = '',
    children,
    disabled,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center whitespace-nowrap
        font-semibold tracking-[-0.005em]
        transition-colors duration-150 active:scale-[.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
        disabled:pointer-events-none disabled:opacity-50
        ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {loading && <Spinner size={14} tone={spinnerTone[variant]} />}
      {children}
    </button>
  );
});