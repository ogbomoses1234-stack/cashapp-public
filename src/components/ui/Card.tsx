import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Removes the ring — useful when nesting a card inside another. */
  flush?: boolean;
}

export function Card({
  className = '',
  flush = false,
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`
        rounded-xl bg-white
        ${flush ? '' : 'ring-1 ring-ink-200/70'}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}