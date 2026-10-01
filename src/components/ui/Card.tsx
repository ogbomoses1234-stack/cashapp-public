import { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
