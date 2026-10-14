import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-ink-50 text-ink-900">
      {/* ═══════════════════════════════════════════════
          LEFT — brand panel (desktop only)
      ═══════════════════════════════════════════════ */}
      <aside className="relative hidden w-1/2 max-w-xl overflow-hidden bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950 lg:flex lg:flex-col">
        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(34,197,94,.35), transparent 65%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,.4), transparent 65%)',
          }}
        />

        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex h-full flex-col p-12">
          <Link to="/" className="flex items-center gap-3 self-start">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white/10 p-1.5 ring-1 ring-inset ring-white/15">
              <Logo size={26} alt="" />
            </span>
            <div className="leading-tight">
              <strong className="block text-[15px] font-bold tracking-[-0.01em] text-white">
                Vickkyaku
              </strong>
              <span className="block text-[11px] font-semibold text-brand-300">
                Cashback
              </span>
            </div>
          </Link>

          <div className="mt-auto max-w-md">
            <h2 className="text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-white">
              Earn cashback
              <br />
              on every sealed pack.
            </h2>
            <p className="mt-4 text-[14px] font-medium leading-relaxed text-white/60">
              Scan the QR seal on any Vickkyaku product — rewards land in your
              wallet instantly. Withdraw to your bank any time.
            </p>
          </div>

          <p className="mt-auto pt-12 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
            vickkyaku.com
          </p>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════
          RIGHT — auth form
      ═══════════════════════════════════════════════ */}
      <main className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}