import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Watermark } from '@/components/brand/Watermark';

/* Pages that hide the tab bar (have their own sticky footer) */
const HIDE_TAB_BAR_PATHS = ['/product/', '/checkout'];

export function CustomerLayout() {
  const { pathname } = useLocation();
  const hideTabs = HIDE_TAB_BAR_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-ink-900">
      {/* ─── Watermark sits behind everything ─────────── */}
      <Watermark />

      {/* ─── Content sits above the watermark ─────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar />
        <main
          className={`mx-auto w-full max-w-3xl flex-1 px-4 pt-5 ${
            hideTabs ? 'pb-8' : 'pb-32'
          }`}
        >
          <Outlet />
        </main>
        {!hideTabs && <BottomTabBar />}
      </div>
    </div>
  );
}
