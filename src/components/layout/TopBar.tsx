import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useCart';
import { getInitials } from '@/utils/format';
import { Logo } from '@/components/brand/Logo';

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
    else if (user?.role === 'staff') navigate('/staff/terminal');
    else navigate(user ? '/home' : '/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F14]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        {/* ─── LEFT: back arrow OR logo ────────────────────── */}
        <div className="flex min-w-0 items-center gap-2.5">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-white/[.07] text-white transition active:scale-95 hover:bg-white/[.12]"
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
            className="flex items-center gap-2.5 active:scale-[.98] transition"
          >
            {/* Logo container — dark rounded square for contrast */}
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[.06] p-1 ring-1 ring-inset ring-white/[.06]">
              <Logo size={24} />
            </div>

            {!showBack && (
              <div className="leading-tight">
                <strong className="block text-[13px] font-black tracking-tight text-white">
                  Vickkyaku
                </strong>
                <span className="block text-[10px] font-semibold text-white/45">
                  Cashback
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ─── RIGHT: cart + profile ─────────────────────── */}
        <div className="flex items-center gap-2">
          {(!user || isCustomer) && (
            <button
              onClick={() => navigate('/cart')}
              aria-label={`Cart (${count} items)`}
              className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/[.07] text-white transition active:scale-95 hover:bg-white/[.12]"
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
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-400 px-1 text-[9.5px] font-black text-[#04140d] shadow-[0_0_0_2px_#0B0F14]">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          )}

          {user ? (
            <button
              onClick={() =>
                navigate(user.role === 'staff' ? '/staff/profile' : '/profile')
              }
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-black text-[#04140d]"
              aria-label="Profile"
            >
              {getInitials(user.fullName ?? user.email)}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-[12px] font-bold text-white/70 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 px-3.5 py-2 text-[12px] font-black text-[#04140d]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-white/[.06]" />
    </header>
  );
}
