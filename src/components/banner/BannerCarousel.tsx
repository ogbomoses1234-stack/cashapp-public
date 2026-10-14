import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Banner } from '@/services/banner.service';

interface Props {
  banners: Banner[];
  intervalMs?: number;
}

export function BannerCarousel({ banners, intervalMs = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const navigate = useNavigate();

  /* Auto-rotate */
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [banners.length, intervalMs, paused]);

  useEffect(() => {
    if (index >= banners.length) setIndex(0);
  }, [banners.length, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      setIndex((i) =>
        dx < 0 ? (i + 1) % banners.length : (i - 1 + banners.length) % banners.length
      );
    }
    touchStart.current = null;
    setTimeout(() => setPaused(false), 4000);
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative mb-5 overflow-hidden rounded-xl bg-ink-900 ring-1 ring-ink-200/70"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => b.ctaUrl && navigate(b.ctaUrl)}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <img
              src={b.imageUrl}
              alt={b.headline}
              className="absolute inset-0 h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/35 to-ink-950/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/55 via-transparent to-transparent" />

            {/* Copy */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-6">
              <h2 className="max-w-md text-[19px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[26px]">
                {b.headline}
              </h2>
              {b.subtext && (
                <p className="mt-1.5 max-w-sm text-[12px] font-medium leading-relaxed text-white/75 sm:text-[13px]">
                  {b.subtext}
                </p>
              )}
              {b.ctaText && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-900 shadow-sm">
                  {b.ctaText}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}