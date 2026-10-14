import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Watermark } from '@/components/brand/Watermark';

const HIDE_TAB_BAR_PATHS = ['/product/', '/checkout', '/scan'];

export function CustomerLayout() {
  const { pathname } = useLocation();
  const hideTabs = HIDE_TAB_BAR_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="relative flex min-h-screen flex-col bg-ink-50 text-ink-900">
      <Watermark opacity={0.02} />

      <Sidebar variant="customer" />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-60">
        <TopBar />

        <main
          className={`
            mx-auto w-full flex-1 px-4 pt-5
            sm:max-w-3xl sm:px-6
            lg:max-w-6xl
            ${hideTabs ? 'pb-10' : 'pb-28 lg:pb-16'}
          `}
        >
          <Outlet />
        </main>

        {/* Footer — full-width, above the mobile bottom nav */}
        <div className={hideTabs ? '' : 'pb-24 lg:pb-0'}>
          <Footer />
        </div>

        {!hideTabs && <BottomTabBar />}
      </div>
    </div>
  );
}