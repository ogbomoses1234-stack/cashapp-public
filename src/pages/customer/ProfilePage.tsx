import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/auth.service';
import { getInitials } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════
   Menu sections
═══════════════════════════════════════════════════════════ */
interface MenuItem {
  to: string;
  icon: ReactNode;
  title: string;
  sub: string;
  tone?: 'default' | 'danger';
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const SECTIONS: MenuSection[] = [
  {
    label: 'Account',
    items: [
      {
        to: '/wallet',
        icon: (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
          </svg>
        ),
        title: 'Wallet & Cash-Out',
        sub: 'Balance, rewards, and withdrawals',
      },
      {
        to: '/payout',
        icon: (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V10l7-5 7 5v11" />
            <path d="M9 21v-6h6v6" />
            <path d="M9 13h6" />
          </svg>
        ),
        title: 'Payout Account',
        sub: 'Bank & account verification',
      },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        to: '/orders',
        icon: (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
          </svg>
        ),
        title: 'Order Tracking',
        sub: 'See all your orders',
      },
      {
        to: '/chat',
        icon: (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        title: 'Chat with Admin',
        sub: 'Get help from our support team',
      },
    ],
  },
  {
    label: 'Support',
    items: [
      {
        to: '/disputes',
        icon: (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        ),
        title: 'Support & Disputes',
        sub: 'Report a used or damaged QR seal',
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   Quick action tiles (top row)
═══════════════════════════════════════════════════════════ */
const QUICK_ACTIONS: Array<{
  to: string;
  label: string;
  icon: ReactNode;
}> = [
  {
    to: '/wallet',
    label: 'Wallet',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    to: '/payout',
    label: 'Payout',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('Sign out of your account?')) return;
    try {
      await logout();
    } catch {}
    clear();
    toast.success('Signed out');
    navigate('/');
  };

  const initials = getInitials(user?.fullName ?? user?.email);
  const phone = user?.phoneNumber ?? '—';
  const email = user?.email ?? '';

  return (
    <div className="space-y-6 pb-4">
      {/* ═══════════════════════════════════════════════════
          PAGE TITLE
      ═══════════════════════════════════════════════════ */}
      <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
        Profile
      </h1>

      {/* ═══════════════════════════════════════════════════
          IDENTITY CARD
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1538] via-[#0F0A2E] to-[#0B0F14] p-5 shadow-[0_16px_36px_-16px_rgba(11,15,20,.7)]">
        {/* Ambient purple glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,.55), transparent 65%)',
          }}
        />

        <div className="relative">
          {/* ─── Avatar + Name row ───────────────────── */}
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-[22px] font-black tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,.9)]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/40">
                Your account
              </p>
              <p className="mt-1 truncate text-[19px] font-black leading-tight tracking-tight text-white">
                {user?.fullName ?? '—'}
              </p>
              <p className="mt-0.5 truncate font-mono text-[12px] font-semibold text-white/60">
                {phone}
              </p>
            </div>
          </div>

          {/* ─── Contact strip ───────────────────────── */}
          {email && (
            <div className="mt-5 flex items-center gap-2.5 border-t border-white/[.08] pt-4">
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-white/[.06] text-white/60">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="truncate text-[12.5px] font-semibold text-white/75">
                {email}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          QUICK ACTIONS
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2.5">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-3.5 text-center shadow-card ring-1 ring-ink-100/60 transition active:scale-[.97]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-700">
              {action.icon}
            </span>
            <span className="text-[11.5px] font-black tracking-tight text-ink-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          MENU SECTIONS
      ═══════════════════════════════════════════════════ */}
      {SECTIONS.map((section) => (
        <section key={section.label}>
          <h2 className="mb-2.5 px-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-ink-400">
            {section.label}
          </h2>

          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
            {section.items.map((item, idx) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3.5 px-4 py-3.5 transition active:bg-ink-50 ${
                  idx < section.items.length - 1
                    ? 'border-b border-ink-100/70'
                    : ''
                }`}
              >
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-ink-50/70 text-ink-700 ring-1 ring-inset ring-ink-100/80">
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
      ))}

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
              Sign out
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-ink-400">
              End your session securely
            </p>
          </div>
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <div className="pt-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ink-300">
          vickkyaku.com
        </p>
        <p className="mt-1 text-[10px] font-semibold text-ink-300/70">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
