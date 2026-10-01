import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/utils/format';
import { Watermark } from '@/components/brand/Watermark';
import {
  StoreIcon,
  ClipboardIcon,
  ScanIcon,
  UserIcon,
} from '@/components/icons/StaffIcons';

const TABS = [
  { to: '/staff/terminal', label: 'Terminal', Icon: StoreIcon },
  { to: '/staff/stock', label: 'My Stock', Icon: ClipboardIcon },
  { to: '/staff/scan', label: 'Scan', Icon: ScanIcon, fab: true },
  { to: '/staff/profile', label: 'Profile', Icon: UserIcon },
];

export function StaffLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const staffId = user?.id?.slice(0, 4).toUpperCase() ?? 'STF';

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F6F7F9] text-ink-900">
      <Watermark opacity={0.045} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ═══════════════════════════════════════════════════
            HEADER — refined
        ═══════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-40 bg-[#0B0F14]">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-violet-400">
                <StoreIcon size={11} />
                <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                  Seller Terminal
                </p>
                <span className="mx-1 h-2.5 w-px bg-white/15" />
                <span className="font-mono text-[10px] tracking-wider text-white/40">
                  {staffId}
                </span>
              </div>
              <strong className="mt-0.5 block truncate text-[15px] font-black tracking-[-0.01em] text-white">
                {user?.fullName ?? 'Seller'}
              </strong>
            </div>

            <button
              onClick={() => navigate('/staff/profile')}
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-[11px] font-black text-white shadow-[0_8px_20px_-8px_rgba(139,92,246,.9)] transition active:scale-95"
              aria-label="Profile"
            >
              {getInitials(user?.fullName)}
            </button>
          </div>
          {/* Bottom subtle glow */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-5">
          <Outlet />
        </main>

        {/* ═══════════════════════════════════════════════════
            BOTTOM NAV — refined
        ═══════════════════════════════════════════════════ */}
        <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3">
          <div className="pointer-events-auto relative flex w-[calc(100%-24px)] max-w-md items-end justify-between gap-1 rounded-[28px] bg-white/95 px-2.5 py-2.5 shadow-[0_-8px_32px_-12px_rgba(11,15,20,.18),0_2px_8px_-4px_rgba(11,15,20,.08)] ring-1 ring-ink-100/80 backdrop-blur-xl">
            {TABS.map(({ to, label, Icon, fab }) => {
              if (fab) {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    aria-label={label}
                    className="group relative -mt-7 flex flex-col items-center gap-1.5 px-3"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-[20px] bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_16px_32px_-14px_rgba(139,92,246,.95)] ring-[3.5px] ring-white transition active:scale-95 group-hover:shadow-[0_20px_40px_-16px_rgba(139,92,246,1)]">
                      <Icon size={22} />
                    </span>
                    <span className="text-[10px] font-black tracking-tight text-ink-900">
                      {label}
                    </span>
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition-all duration-200 ${
                      isActive ? 'text-ink-900' : 'text-ink-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-violet-500/12 text-violet-600 ring-1 ring-inset ring-violet-500/20'
                            : 'text-ink-400'
                        }`}
                      >
                        <Icon size={19} />
                      </span>
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
