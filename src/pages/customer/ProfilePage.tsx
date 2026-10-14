import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/auth.service';
import { getInitials } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import type { ReactNode } from 'react';

interface MenuItem { to: string; icon: ReactNode; title: string; sub: string; }
interface MenuSection { label: string; items: MenuItem[]; }

const SECTIONS: MenuSection[] = [
  {
    label: 'Account',
    items: [
      {
        to: '/wallet',
        icon: <IconWallet />,
        title: 'Wallet & cash-out',
        sub: 'Balance, rewards and withdrawals',
      },
      {
        to: '/payout',
        icon: <IconPayout />,
        title: 'Payout account',
        sub: 'Bank & account verification',
      },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        to: '/orders',
        icon: <IconOrders />,
        title: 'Order tracking',
        sub: 'See all your orders',
      },
   {
  to: '/packages',
  icon: <IconShoppingBag />,
  title: 'Special orders',
  sub: 'Personal shopping from any Nigerian market',
},
      {
        to: '/chat',
        icon: <IconChat />,
        title: 'Chat with admin',
        sub: 'Get help from our support team',
      },
    ],
  },
  {
    label: 'Support',
    items: [
      {
        to: '/disputes',
        icon: <IconFlag />,
        title: 'Support & disputes',
        sub: 'Report a used or damaged QR seal',
      },
    ],
  },
];

const QUICK_ACTIONS = [
  { to: '/wallet', label: 'Wallet', Icon: IconWallet },
  { to: '/orders', label: 'Orders', Icon: IconOrders },
  { to: '/packages', label: 'Special', Icon: IconShoppingBag },
];
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('Sign out of your account?')) return;
    try { await logout(); } catch {}
    clear();
    toast.success('Signed out');
    navigate('/');
  };

  const initials = getInitials(user?.fullName ?? user?.email);
  const phone = user?.phoneNumber ?? '—';
  const email = user?.email ?? '';

  return (
    <div className="space-y-6 pb-4 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
      {/* ─── LEFT COLUMN: identity + quick actions ─── */}
      <div className="space-y-5">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900 lg:hidden">
          Profile
        </h1>

        {/* Identity card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-5 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,.5), transparent 65%)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-[18px] font-bold text-ink-950">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Your account
                </p>
                <p className="mt-1 truncate text-[17px] font-bold leading-tight tracking-[-0.01em]">
                  {user?.fullName ?? '—'}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11.5px] font-medium text-white/60">
                  {phone}
                </p>
              </div>
            </div>

            {email && (
              <div className="mt-5 flex items-center gap-2.5 border-t border-white/[.08] pt-4">
                <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-white/[.06] text-white/60">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span className="truncate text-[12px] font-medium text-white/75">{email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-xl bg-white p-3.5 text-center ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300 active:scale-[.98]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon />
              </span>
              <span className="text-[11.5px] font-semibold tracking-tight text-ink-900">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: menus + sign out ─────────── */}
      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <section key={section.label}>
            <h2 className="mb-2.5 px-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              {section.label}
            </h2>
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
              {section.items.map((item, idx) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-ink-50/60 ${
                    idx < section.items.length - 1 ? 'border-b border-ink-100' : ''
                  }`}
                >
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-700 ring-1 ring-inset ring-ink-200/70">
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
        ))}

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
              Sign out
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-400">
              End your session securely
            </p>
          </div>
        </button>

        <p className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-300 lg:hidden">
          vickkyaku.com
        </p>
      </div>
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────── */
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
      <circle cx="17" cy="15" r="1.4" />
    </svg>
  );
}
function IconPayout() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
function IconShoppingBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}