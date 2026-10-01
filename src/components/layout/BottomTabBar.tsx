import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/home',    label: 'Home',    icon: HomeIcon },
  { to: '/orders',  label: 'Orders',  icon: BagIcon },
  { to: '/scan',    label: 'Scan',    icon: ScanIcon, primary: true },
  { to: '/wallet',  label: 'Wallet',  icon: WalletIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export function BottomTabBar() {
  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3">
      <div className="pointer-events-auto relative flex w-[calc(100%-24px)] max-w-md items-end justify-between gap-1 rounded-[26px] bg-white/95 px-2 py-2 shadow-nav ring-1 ring-ink-100 backdrop-blur-xl">
        {TABS.map(({ to, label, icon: Icon, primary }) => {
          if (primary) {
            return (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                className="relative -mt-6 flex flex-col items-center gap-1 px-2"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-[#04140d] shadow-brand">
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
                `flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition ${
                  isActive ? 'text-ink-900' : 'text-ink-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[22px] w-[22px] ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.6V21h14V9.6" />
    </svg>
  );
}
function BagIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
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
function WalletIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
      <circle cx="17" cy="15" r="1.4" />
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
