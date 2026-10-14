import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { StaffLayout } from '@/layouts/StaffLayout';

/* ─── Public pages ─────────────────────────────────────── */
import LandingPage from '@/pages/LandingPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import CategoryDetailPage from '@/pages/CategoryDetailPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import ScanLandingPage from '@/pages/ScanLandingPage';
import RouteErrorPage from '@/pages/RouteErrorPage';
import NotFoundPage from '@/pages/NotFoundPage';

/* ─── Info pages (new) ─────────────────────────────────── */
import AboutPage from '@/pages/AboutPage';
import HelpPage from '@/pages/HelpPage';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ReturnsPage from '@/pages/ReturnsPage';

/* ─── Customer pages ───────────────────────────────────── */
import HomePage from '@/pages/customer/HomePage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import WalletPage from '@/pages/customer/WalletPage';
import ScannerPage from '@/pages/customer/ScannerPage';
import ScanResultPage from '@/pages/customer/ScanResultPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage from '@/pages/customer/OrdersPage';
import OrderDetailPage from '@/pages/customer/OrderDetailPage';
import PayoutPage from '@/pages/customer/PayoutPage';
import WithdrawalPage from '@/pages/customer/WithdrawalPage';
import DisputesPage from '@/pages/customer/DisputesPage';
import ChatPage from '@/pages/customer/ChatPage';
import ChatThreadPage from '@/pages/customer/ChatThreadPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import PackagesPage from '@/pages/customer/PackagesPage';
import PackageBuilderPage from '@/pages/customer/PackageBuilderPage';
import PackageDetailPage from '@/pages/customer/PackageDetailPage';

/* ─── Staff pages ──────────────────────────────────────── */
import TerminalPage from '@/pages/staff/TerminalPage';
import StockScanPage from '@/pages/staff/StockScanPage';
import StockScanSuccessPage from '@/pages/staff/StockScanSuccessPage';
import StockListPage from '@/pages/staff/StockListPage';
import StaffProfilePage from '@/pages/staff/StaffProfilePage';
import ChangePasswordPage from '@/pages/staff/ChangePasswordPage';
import AccessDeniedPage from '@/pages/staff/AccessDeniedPage';

/* ─── Guards ───────────────────────────────────────────── */
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { MustChangePasswordGuard } from '@/components/staff/MustChangePasswordGuard';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      /* ═══════════════════════════════════════════════════
         PUBLIC ROUTES
      ═══════════════════════════════════════════════════ */
      { path: '/', element: <LandingPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/product/:slug', element: <ProductDetailPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/categories/:slug', element: <CategoryDetailPage /> },
      { path: '/scan/:serialNumber', element: <ScanLandingPage /> },

      /* ─── Info pages (new) ─────────────────────────── */
      { path: '/about', element: <AboutPage /> },
      { path: '/help', element: <HelpPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/returns', element: <ReturnsPage /> },

      /* ═══════════════════════════════════════════════════
         AUTH ROUTES
      ═══════════════════════════════════════════════════ */
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
          { path: '/verify-otp', element: <VerifyOtpPage /> },
          { path: '/profile-setup', element: <ProfileSetupPage /> },
        ],
      },

      /* ═══════════════════════════════════════════════════
         PROTECTED ROUTES
      ═══════════════════════════════════════════════════ */
      {
        element: <ProtectedRoute />,
        children: [
          /* CUSTOMER ONLY */
          {
            element: <RoleGuard allow={['customer']} />,
            children: [
              {
                element: <CustomerLayout />,
                children: [
                  { path: '/home', element: <HomePage /> },
                  { path: '/wallet', element: <WalletPage /> },
                  { path: '/scan', element: <ScannerPage /> },
                  { path: '/scan-result', element: <ScanResultPage /> },
                  { path: '/cart', element: <CartPage /> },
                  { path: '/checkout', element: <CheckoutPage /> },
                  { path: '/orders', element: <OrdersPage /> },
                  { path: '/orders/:id', element: <OrderDetailPage /> },
                  { path: '/payout', element: <PayoutPage /> },
                  { path: '/withdrawal', element: <WithdrawalPage /> },
                  { path: '/disputes', element: <DisputesPage /> },
                  { path: '/chat', element: <ChatPage /> },
                  { path: '/chat/:id', element: <ChatThreadPage /> },
                  { path: '/profile', element: <ProfilePage /> },
                  { path: '/packages', element: <PackagesPage /> },
                  { path: '/packages/new', element: <PackageBuilderPage /> },
                  { path: '/packages/:id', element: <PackageDetailPage /> },
                  { path: '/packages/:id/edit', element: <PackageBuilderPage /> },
                ],
              },
            ],
          },

          /* STAFF ONLY */
          {
            element: <RoleGuard allow={['staff']} />,
            children: [
              { path: '/staff/scan', element: <StockScanPage /> },
              { path: '/staff/scan/success', element: <StockScanSuccessPage /> },
              {
                element: <MustChangePasswordGuard />,
                children: [
                  {
                    element: <StaffLayout />,
                    children: [
                      { path: '/staff/terminal', element: <TerminalPage /> },
                      { path: '/staff/stock', element: <StockListPage /> },
                      { path: '/staff/profile', element: <StaffProfilePage /> },
                      { path: '/staff/change-password', element: <ChangePasswordPage /> },
                      { path: '/staff/denied', element: <AccessDeniedPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      /* Redirects + 404 */
      { path: '/dashboard', element: <Navigate to="/home" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);