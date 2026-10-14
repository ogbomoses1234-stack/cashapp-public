import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useCart';
import { getInitials } from '@/utils/format';
import { Logo } from '@/components/brand/Logo';
import { SearchBar } from './SearchBar';

/* ─── Paths that should NOT show a back arrow ──────────── */
const ROOT_PATHS = new Set([
  '/',
  '/home',
  '/products',
  '/categories',
  '/wallet',
  '/orders',
  '/profile',
  '/chat',
  '/packages',
  '/staff/terminal',
  '/staff/stock',
  '/staff/profile',
  '/login',
  '/signup',
  '/verify-otp',
  '/profile-setup',
]);

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { count } = useCart();

  const isCustomer = user?.role === 'customer';
  const showBack = !ROOT_PATHS.has(location.pathname);

  const handleBack = () => {
    const navState = (window.history.state as { idx?: number } | null) ?? null;
    const hasInternalHistory = (navState?.idx ?? 0) > 0;
    if (hasInternalHistory) {
      navigate(-1);
      return;
    }
    const path = location.pathname;
    if (path.startsWith('/product/')) navigate('/products');
    else if (path.startsWith('/categories/')) navigate('/categories');
    else if (path.startsWith('/chat/')) navigate('/chat');
    else if (path.startsWith('/orders/')) navigate('/orders');
    else if (path.startsWith('/packages/')) navigate('/packages');
    else if (user?.role === 'staff') navigate('/staff/terminal');
    else navigate(user ? '/home' : '/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:max-w-3xl sm:px-6 lg:h-16">
        {/* ═════════════════════════════════════════════
            LEFT — mobile only (sidebar shows brand on lg+)
        ═════════════════════════════════════════════ */}
        <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-ink-600 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <Link
            to={user?.role === 'staff' ? '/staff/terminal' : user ? '/home' : '/'}
            className="flex items-center gap-2 transition-opacity active:opacity-80"
          >
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-900 p-1">
              <Logo size={22} alt="" />
            </span>
            {!showBack && (
              <div className="leading-tight">
                <strong className="block text-[13px] font-bold tracking-[-0.01em] text-ink-900">
                  Vickkyaku
                </strong>
                <span className="block text-[10px] font-semibold text-ink-500">
                  {user?.role === 'staff' ? 'Seller' : 'Cashback'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ═════════════════════════════════════════════
            CENTER — desktop only
        ═════════════════════════════════════════════ */}
        <div className="hidden flex-1 lg:flex lg:justify-start">
          <SearchBar variant="inline" to={user ? '/products' : '/'} />
        </div>

        {/* ═════════════════════════════════════════════
            RIGHT — cart + avatar / auth
        ═════════════════════════════════════════════ */}
        <div className="ml-auto flex items-center gap-1.5">
          {(!user || isCustomer) && (
            <button
              type="button"
              onClick={() => navigate('/cart')}
              aria-label={`Cart (${count} items)`}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-600 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2 3h3l2.5 12h11l2-8H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-brand-500 px-1 text-[9.5px] font-bold text-ink-950 ring-2 ring-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          )}

          {user ? (
            <button
              type="button"
              onClick={() =>
                navigate(user.role === 'staff' ? '/staff/profile' : '/profile')
              }
              aria-label="Profile"
              className={`
                grid h-9 w-9 place-items-center rounded-lg text-[11px] font-bold transition-transform active:scale-95
                ${
                  user.role === 'staff'
                    ? 'bg-gradient-to-br from-violet-400 to-violet-600 text-white'
                    : 'bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950'
                }
              `}
            >
              {getInitials(user.fullName ?? user.email)}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-[12.5px] font-semibold text-ink-600 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-900 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-ink-900 px-3 py-2 text-[12.5px] font-semibold text-white transition-colors duration-150 hover:bg-ink-800 active:scale-[.98]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}