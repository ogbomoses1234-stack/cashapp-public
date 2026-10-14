import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top whenever the pathname changes.
 * Placed in RootLayout so it applies to every route.
 *
 * Uses `behavior: 'instant'` — smooth scrolling on route change feels
 * janky because the user is already expecting a page load.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}