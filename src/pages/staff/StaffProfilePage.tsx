import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/auth.service';
import { getInitials } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════
   Menu
═══════════════════════════════════════════════════════════ */
interface MenuItem {
  to: string;
  icon: ReactNode;
  title: string;
  sub: string;
}

const MENU: MenuItem[] = [
  {
    to: '/staff/terminal',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h16l-1 12H5z" />
        <path d="M4 8 7 4h10l3 4" />
        <path d="M9 12h6" />
      </svg>
    ),
    title: 'My Stock-Out Terminal',
    sub: "Today's counter & live ledger",
  },
  {
    to: '/staff/stock',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3h14v18H5z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
    title: 'My Stock List',
    sub: 'Everything you took out for sale',
  },
  {
    to: '/staff/scan',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M3 12h18" />
      </svg>
    ),
    title: 'Scan for Sales',
    sub: 'Log new products you take out',
  },
  {
    to: '/staff/change-password',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Change Password',
    sub: 'Update your credentials',
  },
];

export default function StaffProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('End your shift and sign out?')) return;
    try {
      await logout();
    } catch {}
    clear();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = getInitials(user?.fullName);
  const staffId = user?.id?.slice(0, 4).toUpperCase() ?? 'STF';

  return (
    <div className="space-y-6 pb-4">
      {/* ═══════════════════════════════════════════════════
          IDENTITY CARD
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1538] via-[#0F0A2E] to-[#0B0F14] p-5 shadow-[0_16px_36px_-16px_rgba(11,15,20,.7)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,.55), transparent 65%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-[22px] font-black tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,.9)]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-300">
                Seller
              </p>
              <p className="mt-1 truncate text-[18px] font-black tracking-tight text-white">
                {user?.fullName ?? '—'}
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-white/50">
                STF-{staffId}
              </p>
            </div>
          </div>

          {user?.email && (
            <div className="mt-5 flex items-center gap-2.5 border-t border-white/[.08] pt-4">
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-white/[.06] text-white/60">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="truncate text-[12.5px] font-semibold text-white/75">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          QUICK ACTIONS
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2.5">
        <QuickLink
          to="/staff/terminal"
          label="Terminal"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h16l-1 12H5z" />
              <path d="M4 8 7 4h10l3 4" />
            </svg>
          }
        />
        <QuickLink
          to="/staff/stock"
          label="Stock"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3h14v18H5z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          }
        />
        <QuickLink
          to="/staff/scan"
          label="Scan"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M3 12h18" />
            </svg>
          }
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          MENU
      ═══════════════════════════════════════════════════ */}
      <section>
        <h2 className="mb-2.5 px-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-ink-400">
          Menu
        </h2>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
          {MENU.map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3.5 px-4 py-3.5 transition active:bg-ink-50 ${
                idx < MENU.length - 1 ? 'border-b border-ink-100/70' : ''
              }`}
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold tracking-tight text-ink-900">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] font-semibold text-ink-400">
                  {item.sub}
                </p>
              </div>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 flex-shrink-0 text-ink-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ACCESS DENIED INFO
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
        <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-700">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </span>
        <p className="text-[11.5px] font-semibold leading-relaxed text-amber-900/90">
          Seller accounts cannot claim consumer cashback rewards or access the
          customer wallet.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════
          SIGN OUT
      ═══════════════════════════════════════════════════ */}
      <section>
        <h2 className="mb-2.5 px-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-ink-400">
          Session
        </h2>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99] active:bg-rose-50"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/15">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold tracking-tight text-rose-600">
              End shift
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-ink-400">
              Sign out of your seller terminal
            </p>
          </div>
        </button>
      </section>

      <p className="pt-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-ink-300">
        vickkyaku.com
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Quick link
═══════════════════════════════════════════════════════════ */
function QuickLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-3.5 text-center shadow-card ring-1 ring-ink-100/60 transition active:scale-[.97]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
        {icon}
      </span>
      <span className="text-[11.5px] font-black tracking-tight text-ink-900">
        {label}
      </span>
    </Link>
  );
}
