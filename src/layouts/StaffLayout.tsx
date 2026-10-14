import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/utils/format';
import { Watermark } from '@/components/brand/Watermark';
import { Sidebar } from '@/components/layout/Sidebar';

const TABS = [
  { to: '/staff/terminal', label: 'Terminal', Icon: StoreIcon },
  { to: '/staff/stock',    label: 'Stock',    Icon: ClipboardIcon },
  { to: '/staff/scan',     label: 'Scan',     Icon: ScanIcon, fab: true },
  { to: '/staff/profile',  label: 'Profile',  Icon: UserIcon },
];

export function StaffLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const staffId = user?.id?.slice(0, 4).toUpperCase() ?? 'STF';

  return (
    <div className="relative flex min-h-screen flex-col bg-ink-50 text-ink-900">
      <Watermark opacity={0.02} />

      {/* Desktop sidebar — violet accent */}
      <Sidebar variant="staff" />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-60">
        {/* ═══════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════ */}
        <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:max-w-3xl sm:px-6 lg:h-16">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-violet-600">
                <StoreIcon size={11} className="h-3 w-3" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Seller Terminal
                </p>
                <span className="mx-1 h-2.5 w-px bg-ink-200" />
                <span className="font-mono text-[10px] font-semibold tracking-wider text-ink-400">
                  {staffId}
                </span>
              </div>
              <strong className="mt-0.5 block truncate text-[14px] font-bold tracking-[-0.01em] text-ink-900">
                {user?.fullName ?? 'Seller'}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => navigate('/staff/profile')}
              aria-label="Profile"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 text-[11px] font-bold text-white transition-transform active:scale-95"
            >
              {getInitials(user?.fullName)}
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            MAIN
        ═══════════════════════════════════════════════ */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5 sm:max-w-3xl sm:px-6 lg:pb-16">
          <Outlet />
        </main>

        {/* ═══════════════════════════════════════════════
            BOTTOM NAV — mobile only
        ═══════════════════════════════════════════════ */}
        <nav
          className="
            pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center
            pb-[max(0.75rem,env(safe-area-inset-bottom))]
            lg:hidden
          "
          aria-label="Staff navigation"
        >
          <div className="pointer-events-auto relative flex w-[calc(100%-24px)] max-w-md items-end justify-between gap-0.5 rounded-2xl bg-white/95 px-2 py-2 ring-1 ring-ink-200 shadow-lg shadow-ink-950/5 backdrop-blur-xl">
            {TABS.map(({ to, label, Icon, fab }) => {
              if (fab) {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    aria-label={label}
                    className="relative -mt-6 flex flex-1 flex-col items-center gap-1 px-1"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/40 ring-4 ring-white transition-transform active:scale-95">
                      <Icon className="h-6 w-6" />
                    </span>
                  </NavLink>
                );
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9.5px] font-semibold tracking-[-0.005em] transition-colors duration-150 ${
                      isActive ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-[21px] w-[21px] transition-all ${
                          isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'
                        }`}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Icons
═══════════════════════════════════════════════════════════ */
function StoreIcon({ className = '', size = 20 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" />
      <path d="M4 8 7 4h10l3 4" />
      <path d="M9 12h6" />
    </svg>
  );
}
function ClipboardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}
function ScanIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h18" />
    </svg>
  );
}
function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}