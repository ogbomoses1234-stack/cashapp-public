interface WatermarkProps {
  /** Opacity 0–1. Default is very subtle. */
  opacity?: number;
  /** Optional logo path (defaults to /vickkyaku.png) */
  logoSrc?: string;
}

/**
 * Fixed, non-interactive brand watermark behind all page content.
 * Now much subtler than before — sits under ink-50 backgrounds without
 * fighting the content for attention.
 */
export function Watermark({
  opacity = 0.02,
  logoSrc = '/vickkyaku.png',
}: WatermarkProps) {
  return (
    <div
      aria-hidden
      className="watermark-layer pointer-events-none fixed inset-0 z-0 print:hidden"
      style={{ opacity }}
    >
      {/* Center — large ghost logo */}
      <img
        src={logoSrc}
        alt=""
        className="absolute left-1/2 top-1/2 w-[58%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 select-none"
        style={{ filter: 'grayscale(1) brightness(0.4)' }}
        draggable={false}
      />

      {/* Top-left accent */}
      <img
        src={logoSrc}
        alt=""
        className="absolute left-[-6%] top-[18%] w-[26%] max-w-[180px] -rotate-[18deg] select-none"
        style={{ filter: 'grayscale(1) brightness(0.4)' }}
        draggable={false}
      />

      {/* Bottom-right accent */}
      <img
        src={logoSrc}
        alt=""
        className="absolute bottom-[14%] right-[-6%] w-[30%] max-w-[200px] rotate-[22deg] select-none"
        style={{ filter: 'grayscale(1) brightness(0.4)' }}
        draggable={false}
      />
    </div>
  );
}