import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
  /** Use dark variant for admin console */
  dark?: boolean;
  style?: CSSProperties;
}

export function Skeleton({
  width,
  height,
  rounded = 'rounded-lg',
  className = '',
  dark = false,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${dark ? 'skeleton-dark' : ''} ${rounded} ${className}`}
      style={{ width, height, ...style }}
      aria-hidden
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   Product card skeleton — matches the real ProductCard
═══════════════════════════════════════════════════════════ */
export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
      <div className="p-2.5 pb-0">
        <Skeleton height={140} rounded="rounded-lg" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <Skeleton height={13} width="85%" rounded="rounded" />
        <div className="mt-2">
          <Skeleton height={11} width="55%" rounded="rounded" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton height={18} width={70} rounded="rounded" />
          <Skeleton height={32} width={64} rounded="rounded-lg" />
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   List row skeleton — matches orders / transactions / chats
═══════════════════════════════════════════════════════════ */
export function ListRowSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-ink-200/70">
      <Skeleton width={44} height={44} rounded="rounded-lg" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            height={i === 0 ? 13 : 11}
            width={i === 0 ? '70%' : '45%'}
            rounded="rounded"
          />
        ))}
      </div>
      <Skeleton width={60} height={18} rounded="rounded" />
    </div>
  );
}

export function ListSkeleton({ count = 4, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} lines={lines} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Full-page loading overlay
═══════════════════════════════════════════════════════════ */
export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton height={14} width={90} rounded="rounded" />
        <Skeleton height={26} width={180} rounded="rounded-lg" />
      </div>
      <Skeleton height={140} rounded="rounded-xl" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}