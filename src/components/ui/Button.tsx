import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-br from-brand-400 to-brand-600 text-[#04140d] shadow-glow hover:brightness-105',
  outline: 'bg-white text-ink-900 shadow-[inset_0_0_0_1.5px_rgba(11,16,28,.12)] hover:shadow-[inset_0_0_0_1.5px_rgba(11,16,28,.28)]',
  ghost: 'bg-slate-100 text-ink-900 hover:bg-slate-200',
  dark: 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] hover:bg-white/15',
  danger: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2.5 text-xs rounded-xl',
  md: 'px-4.5 py-3 text-sm rounded-2xl',
  lg: 'px-5 py-4 text-[15px] rounded-[17px]',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', block, loading, className = '', children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition active:scale-[.97] disabled:opacity-60 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
});
