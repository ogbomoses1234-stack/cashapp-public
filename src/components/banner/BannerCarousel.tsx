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

  /* ─── Auto-rotate ──────────────────────────────────────── */
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [banners.length, intervalMs, paused]);

  /* ─── Reset index if banners change ────────────────────── */
  useEffect(() => {
    if (index >= banners.length) setIndex(0);
  }, [banners.length, index]);

  /* ─── Swipe ────────────────────────────────────────────── */
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
      className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F2A24] via-[#0A1512] to-[#0A0D14]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] w-full">
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => b.ctaUrl && navigate(b.ctaUrl)}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            {/* Background image */}
            <img
              src={b.imageUrl}
              alt={b.headline}
              className="absolute inset-0 h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Gradients for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Copy */}
            <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-7">
              <h2 className="max-w-md text-[22px] font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-[30px]">
                {b.headline}
              </h2>
              {b.subtext && (
                <p className="mt-1.5 max-w-sm text-[12.5px] font-medium leading-relaxed text-white/75">
                  {b.subtext}
                </p>
              )}
              {b.ctaText && (
                <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[12px] font-black text-ink-900 shadow-[0_8px_24px_-8px_rgba(0,0,0,.6)]">
                  {b.ctaText}
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
