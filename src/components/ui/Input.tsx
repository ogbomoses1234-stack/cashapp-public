import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string | null;
  prefix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, prefix, className = '', ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-[11.5px] font-bold tracking-wide text-slate-500">
          {label}
        </span>
      )}
      <div className="flex items-stretch gap-2">
        {prefix}
        <input
          ref={ref}
          className={`w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-brand-500 ${className}`}
          {...rest}
        />
      </div>
      {error && <span className="mt-1 block text-xs font-semibold text-rose-500">{error}</span>}
    </label>
  );
});
