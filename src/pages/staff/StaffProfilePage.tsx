import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/auth.service';
import { getInitials } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import type { ReactNode } from 'react';

interface MenuItem { to: string; icon: ReactNode; title: string; sub: string; }

const MENU: MenuItem[] = [
  {
    to: '/staff/terminal',
    icon: <IconStore />,
    title: 'My Stock-Out Terminal',
    sub: "Today's counter & live ledger",
  },
  {
    to: '/staff/stock',
    icon: <IconClipboard />,
    title: 'My Stock List',
    sub: 'Everything you took out for sale',
  },
  {
    to: '/staff/scan',
    icon: <IconScan />,
    title: 'Scan for Sales',
    sub: 'Log new products you take out',
  },
  {
    to: '/staff/change-password',
    icon: <IconLock />,
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
    try { await logout(); } catch {}
    clear();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = getInitials(user?.fullName);
  const staffId = user?.id?.slice(0, 4).toUpperCase() ?? 'STF';

  return (
    <div className="space-y-6 pb-4 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
      {/* ─── LEFT: identity + quick actions ─────────── */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-ink-900 to-ink-950 p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,.65), transparent 65%)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 text-[18px] font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">
                  Seller
                </p>
                <p className="mt-1 truncate text-[17px] font-bold leading-tight tracking-[-0.01em] text-white">
                  {user?.fullName ?? '—'}
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] font-semibold text-white/50">
                  STF-{staffId}
                </p>
              </div>
            </div>

            {user?.email && (
              <div className="mt-5 flex items-center gap-2.5 border-t border-white/[.08] pt-4">
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-white/[.06] text-white/60">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="truncate text-[12px] font-medium text-white/75">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2.5">
          <QuickLink to="/staff/terminal" label="Terminal" Icon={IconStore} />
          <QuickLink to="/staff/stock" label="Stock" Icon={IconClipboard} />
          <QuickLink to="/staff/scan" label="Scan" Icon={IconScan} />
        </div>
      </div>

      {/* ─── RIGHT: menu + sign out ────────────────── */}
      <div className="space-y-5">
        <section>
          <h2 className="mb-2.5 px-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-400">
            Menu
          </h2>
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
            {MENU.map((item, idx) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-ink-50/60 ${
                  idx < MENU.length - 1 ? 'border-b border-ink-100' : ''
                }`}
              >
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ink-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] font-medium text-ink-400">
                    {item.sub}
                  </p>
                </div>
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Restriction note */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
          <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-amber-500/15 text-amber-700">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          <p className="text-[11.5px] font-medium leading-relaxed text-amber-900/90">
            Seller accounts cannot claim consumer cashback rewards or access the
            customer wallet.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 rounded-xl bg-white px-4 py-3.5 text-left ring-1 ring-ink-200/70 transition-colors hover:bg-rose-50/60 active:scale-[.99]"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold tracking-[-0.005em] text-rose-600">
              End shift
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-400">
              Sign out of your seller terminal
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function QuickLink({
  to, label, Icon,
}: { to: string; label: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-xl bg-white p-3.5 text-center ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300 active:scale-[.98]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[11.5px] font-semibold tracking-tight text-ink-900">{label}</span>
    </Link>
  );
}

function IconStore({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 8h16l-1 12H5z" />
      <path d="M4 8 7 4h10l3 4" />
      <path d="M9 12h6" />
    </svg>
  );
}
function IconClipboard({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3h14v18H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}
function IconScan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h18" />
    </svg>
  );
}
function IconLock({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}