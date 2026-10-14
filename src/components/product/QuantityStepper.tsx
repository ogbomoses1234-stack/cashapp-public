interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { btn: 'h-7 w-7 text-[14px]', val: 'w-8 text-[13px]', gap: 'gap-1.5' },
  md: { btn: 'h-9 w-9 text-[16px]', val: 'w-10 text-[14px]', gap: 'gap-2' },
  lg: { btn: 'h-11 w-11 text-[18px]', val: 'w-12 text-[15px]', gap: 'gap-3' },
};

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = 'md',
}: Props) {
  const s = SIZES[size];
  const dec = () => !disabled && value > min && onChange(value - 1);
  const inc = () => !disabled && value < max && onChange(value + 1);

  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`
          grid place-items-center rounded-lg bg-ink-100 font-semibold text-ink-700
          transition-colors duration-150 hover:bg-ink-200 active:scale-95
          disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
          ${s.btn}
        `}
      >
        −
      </button>
      <span
        className={`text-center font-semibold tabular-nums text-ink-900 ${s.val}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`
          grid place-items-center rounded-lg bg-ink-100 font-semibold text-ink-700
          transition-colors duration-150 hover:bg-ink-200 active:scale-95
          disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
          ${s.btn}
        `}
      >
        +
      </button>
    </div>
  );
}