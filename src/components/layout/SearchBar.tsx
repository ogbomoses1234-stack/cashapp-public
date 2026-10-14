import { Link } from 'react-router-dom';

interface Props {
  to?: string;
  placeholder?: string;
  /** `pill` = full-width tap target (mobile), `inline` = compact desktop input look */
  variant?: 'pill' | 'inline';
  className?: string;
}

export function SearchBar({
  to = '/products',
  placeholder = 'Search products…',
  variant = 'pill',
  className = '',
}: Props) {
  /* ─── Desktop: inline input-styled link ─────────────── */
  if (variant === 'inline') {
    return (
      <Link
        to={to}
        className={`
          group flex h-10 w-full max-w-md items-center gap-2.5 rounded-lg
          bg-ink-50 px-3 ring-1 ring-inset ring-ink-200
          transition-colors duration-150 hover:bg-white hover:ring-ink-300
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
          ${className}
        `}
        aria-label="Search products"
      >
        <SearchIcon />
        <span className="flex-1 truncate text-left text-[13px] font-medium text-ink-400 group-hover:text-ink-500">
          {placeholder}
        </span>
        <kbd className="hidden items-center gap-0.5 rounded border border-ink-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-400 sm:inline-flex">
          ⌘K
        </kbd>
      </Link>
    );
  }

  /* ─── Mobile: pill tap target ───────────────────────── */
  return (
    <Link
      to={to}
      className={`
        flex w-full items-center gap-2.5 rounded-lg bg-white px-3.5 py-3
        ring-1 ring-inset ring-ink-200
        transition-colors duration-150 active:scale-[.99] hover:bg-ink-50
        ${className}
      `}
    >
      <SearchIcon />
      <span className="flex-1 text-left text-[13.5px] font-medium text-ink-400">
        {placeholder}
      </span>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-ink-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 flex-shrink-0 text-ink-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}