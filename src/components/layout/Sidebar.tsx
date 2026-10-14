import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getInitials, formatNaira } from '@/utils/format';
import { Logo } from '@/components/brand/Logo';

type Variant = 'customer' | 'staff';

interface Props {
  variant?: Variant;
}

/* ═══════════════════════════════════════════════════════════
   Nav links per state
═══════════════════════════════════════════════════════════ */
const CUSTOMER_LINKS = [
  { to: '/home',     label: 'Home',      Icon: HomeIcon },
  { to: '/orders',   label: 'Orders',    Icon: BagIcon },
  { to: '/packages', label: 'Special',   Icon: GlobeIcon },
  { to: '/wallet',   label: 'Wallet',    Icon: WalletIcon },
  { to: '/profile',  label: 'Profile',   Icon: UserIcon },
];

const GUEST_LINKS = [
  { to: '/',           label: 'Home',       Icon: HomeIcon },
  { to: '/products',   label: 'Products',   Icon: GridIcon },
  { to: '/categories', label: 'Categories', Icon: Grid2Icon },
];

const STAFF_LINKS = [
  { to: '/staff/terminal', label: 'Terminal', Icon: StoreIcon },
  { to: '/staff/stock',    label: 'My Stock', Icon: ClipboardIcon },
  { to: '/staff/scan',     label: 'Scan',     Icon: ScanIcon },
  { to: '/staff/profile',  label: 'Profile',  Icon: UserIcon },
];

export function Sidebar({ variant = 'customer' }: Props) {
  const user = useAuthStore((s) => s.user);
  const isStaff = variant === 'staff';
  const isGuest = !user;

  const links = isStaff ? STAFF_LINKS : isGuest ? GUEST_LINKS : CUSTOMER_LINKS;

  const accentText = isStaff ? 'text-violet-600' : 'text-brand-600';
  const accentBgActive = isStaff
    ? 'bg-violet-50 text-violet-700 ring-violet-100'
    : 'bg-brand-50 text-brand-700 ring-brand-100';
  const accentHover = isStaff ? 'hover:bg-violet-50/60' : 'hover:bg-brand-50/60';
  const accentDot = isStaff ? 'bg-violet-500' : 'bg-brand-500';
  const accentCta = isStaff
    ? 'bg-violet-600 hover:bg-violet-700 text-white'
    : 'bg-brand-500 hover:bg-brand-600 text-ink-950';

  const balance = user?.walletBalance ?? '0.00';

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-ink-200 lg:bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-ink-200 px-5">
        <Link
          to={isStaff ? '/staff/terminal' : user ? '/home' : '/'}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-ink-900 p-1">
            <Logo size={22} alt="" />
          </span>
          <div className="leading-tight">
            <strong className="block text-[13px] font-bold tracking-[-0.01em] text-ink-900">
              Vickkyaku
            </strong>
            <span className={`block text-[10px] font-semibold ${accentText}`}>
              {isStaff ? 'Seller' : 'Cashback'}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold tracking-[-0.005em] transition-colors duration-150 ${
                isActive
                  ? `${accentBgActive} ring-1 ring-inset`
                  : `text-ink-600 ${accentHover} hover:text-ink-900`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{label}</span>
                {isActive && (
                  <span className={`ml-auto h-1.5 w-1.5 rounded-full ${accentDot}`} />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Primary CTA */}
        {!isGuest && (
          <div className="pt-3">
            {isStaff ? (
              <Link
                to="/staff/scan"
                className={`flex items-center justify-center gap-2 rounded-lg ${accentCta} px-3 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 active:scale-[.98]`}
              >
                <ScanIcon className="h-4 w-4" />
                Scan stock
              </Link>
            ) : (
              <Link
                to="/packages/new"
                className={`flex items-center justify-center gap-2 rounded-lg ${accentCta} px-3 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 active:scale-[.98]`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New special list
              </Link>
            )}
          </div>
        )}

        {/* Guest CTAs */}
        {isGuest && (
          <div className="space-y-2 pt-3">
            <Link
              to="/signup"
              className={`flex items-center justify-center gap-2 rounded-lg ${accentCta} px-3 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 active:scale-[.98]`}
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink-900 ring-1 ring-inset ring-ink-200 transition-colors duration-150 hover:bg-ink-50"
            >
              Log in
            </Link>
          </div>
        )}
      </nav>

      {/* Wallet card (customer only, logged in) */}
      {!isStaff && user && (
        <Link
          to="/wallet"
          className="mx-3 mb-3 block rounded-lg bg-gradient-to-br from-ink-900 to-ink-800 p-3.5 text-white transition-colors duration-150 hover:from-ink-800 hover:to-ink-800"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
            Wallet balance
          </p>
          <p className="mt-1 text-[18px] font-bold tracking-[-0.02em] tabular-nums">
            {formatNaira(balance)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-brand-300">
            <span>Cash out</span>
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* User footer (only when logged in) */}
      {user && (
        <div className="border-t border-ink-200 p-3">
          <Link
            to={isStaff ? '/staff/profile' : '/profile'}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-ink-50"
          >
            <span
              className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${
                isStaff
                  ? 'bg-gradient-to-br from-violet-400 to-violet-600 text-white'
                  : 'bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950'
              } text-[11px] font-bold`}
            >
              {getInitials(user?.fullName ?? user?.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-ink-900">
                {user?.fullName ?? user?.email ?? 'Account'}
              </p>
              <p className="truncate text-[10.5px] font-medium text-ink-400">
                {isStaff ? 'Seller' : 'Customer'}
              </p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

/* ─── Icons ─────────────────────────────────────────────── */
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
function GlobeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18" />
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
function StoreIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function Grid2Icon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  );
}