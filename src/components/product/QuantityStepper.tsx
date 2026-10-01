interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { btn: 'h-8 w-8 text-base', val: 'w-8 text-sm' },
  md: { btn: 'h-10 w-10 text-lg', val: 'w-10 text-base' },
  lg: { btn: 'h-12 w-12 text-xl', val: 'w-14 text-lg' },
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
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`grid place-items-center rounded-full bg-slate-100 font-black text-ink-900 transition active:scale-95 disabled:opacity-40 ${s.btn}`}
      >
        −
      </button>
      <span className={`text-center font-black ${s.val}`}>{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`grid place-items-center rounded-full bg-slate-100 font-black text-ink-900 transition active:scale-95 disabled:opacity-40 ${s.btn}`}
      >
        +
      </button>
    </div>
  );
}
