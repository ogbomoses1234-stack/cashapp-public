import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Watermark } from '@/components/brand/Watermark';

interface Props {
  children?: React.ReactNode;
}

/**
 * Shell for PUBLIC pages (Landing, Products, Categories, ProductDetail).
 * Renders the sidebar only when the user is logged in — guests get a
 * clean centered layout with just the top bar.
 */
export function PublicShell({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-ink-50 text-ink-900">
      <Watermark opacity={0.02} />

      <Sidebar variant="customer" />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-60">
        <TopBar />

        <main className="mx-auto w-full flex-1 px-4 pb-16 pt-5 sm:max-w-3xl sm:px-6 lg:max-w-6xl">
          {children ?? <Outlet />}
        </main>

        <Footer />
      </div>
    </div>
  );
}