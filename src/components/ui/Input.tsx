import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string | null;
  hint?: string;
  prefix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, prefix, className = '', id, ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="block">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700"
        >
          {label}
        </label>
      )}

      <div className="flex items-stretch gap-2">
        {prefix}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-11 w-full rounded-lg border-0 bg-white px-3.5
            text-[14px] font-medium text-ink-900
            outline-none ring-1 ring-inset transition-colors duration-150
            placeholder:font-normal placeholder:text-ink-400
            disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400
            focus:ring-2
            ${
              error
                ? 'ring-rose-300 focus:ring-rose-500/60'
                : 'ring-ink-200 focus:ring-brand-500'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-[11.5px] font-medium text-rose-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px] font-medium text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
});