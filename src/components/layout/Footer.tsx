import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { toast } from '@/hooks/useToast';

/* ═══════════════════════════════════════════════════════════
   LINK DATA
═══════════════════════════════════════════════════════════ */
const NEED_HELP = [
  { label: 'Chat with us', to: '/chat' },
  { label: 'Help Center', to: '#' },
  { label: 'Contact Us', to: '/chat' },
  { label: 'Track my order', to: '/orders' },
];

const USEFUL_LINKS = [
  { label: 'How to shop on Vickkyaku', to: '#' },
  { label: 'Delivery options and timelines', to: '#' },
  { label: 'How to return a product', to: '#' },
  { label: 'Report a Product', to: '/disputes' },
  { label: 'Dispute Resolution Policy', to: '#' },
  { label: 'Returns & Refund Timeline', to: '#' },
  { label: 'Return Policy', to: '#' },
];

const ABOUT = [
  { label: 'About us', to: '#' },
  { label: 'Vickkyaku careers', to: '#' },
  { label: 'Terms and Conditions', to: '#' },
  { label: 'Payment Information Guidelines', to: '#' },
  { label: 'Our Sellers', to: '/products' },
  { label: 'Flash Sales', to: '/products?sort=price_asc' },
];

const PRIVACY = [
  { label: 'Privacy Notice', to: '#' },
  { label: 'Cookie Notice', to: '#' },
  { label: 'Cookie Preferences', to: '#' },
];

const MAKE_MONEY = [
  { label: 'Sell on Vickkyaku', to: '/login' },
  { label: 'Vendor hub', to: '#' },
  { label: 'Become a Sales Consultant', to: '/signup' },
];

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
      </svg>
    ),
  },
];

const PAYMENT_METHODS = [
  { label: 'Visa', Svg: VisaLogo },
  { label: 'Mastercard', Svg: MastercardLogo },
  { label: 'Verve', Svg: VerveLogo },
  { label: 'Paystack', Svg: PaystackLogo },
];

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Enter a valid email');
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Subscribed! Check your inbox.');
    setEmail('');
    setSubscribing(false);
  };

  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-300">
      {/* Newsletter */}
      <div className="border-b border-white/[.06]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-md">
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-white">
                Subscribe to our newsletter
              </h3>
              <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-400">
                Get updates on our latest offers, deals, and cashback campaigns.
                You can withdraw consent at any time.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="mt-4 flex w-full max-w-md gap-2 lg:mt-0">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter e-mail address"
                  disabled={subscribing}
                  className="h-11 w-full rounded-lg border-0 bg-white/[.06] pl-9 pr-3.5 text-[13px] font-medium text-white outline-none ring-1 ring-inset ring-white/10 transition-colors placeholder:text-ink-500 focus:bg-white/[.08] focus:ring-2 focus:ring-brand-500/60 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="h-11 flex-shrink-0 rounded-lg bg-brand-500 px-5 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-brand-600 active:scale-[.98] disabled:opacity-60"
              >
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Link columns — 3 cols now */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Col 1 */}
          <div className="space-y-8">
            <FooterGroup title="Need help?" links={NEED_HELP} />
            <FooterGroup title="Useful links" links={USEFUL_LINKS} />
          </div>

          {/* Col 2 */}
          <div className="space-y-8">
            <FooterGroup title="About Vickkyaku" links={ABOUT} />
            <FooterGroup title="Privacy" links={PRIVACY} />
          </div>

          {/* Col 3 */}
          <div className="space-y-8">
            <FooterGroup title="Make money with Vickkyaku" links={MAKE_MONEY} />
          </div>
        </div>

        {/* Contact + Social */}
        <div className="mt-12 grid gap-8 border-t border-white/[.06] pt-10 sm:grid-cols-2">
          {/* Contact — email only */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Contact us
            </h4>
            <div className="mt-4">
              <p className="text-[12.5px] font-medium text-ink-500">
                For support, partnerships, or general enquiries:
              </p>
              <a
                href="mailto:info@vickkyaku.store"
                className="mt-2 inline-flex items-center gap-2 text-[13px] font-semibold text-white transition-colors hover:text-brand-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                info@vickkyaku.store
              </a>
            </div>
          </div>

          {/* Social + payments */}
          <div className="space-y-8">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Join us on
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-white/[.06] text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Payment methods
              </h4>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {PAYMENT_METHODS.map(({ label, Svg }) => (
                  <div
                    key={label}
                    aria-label={label}
                    className="grid h-9 w-14 place-items-center rounded-md bg-white p-1.5 ring-1 ring-inset ring-white/10"
                  >
                    <Svg />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-white/10 p-1 ring-1 ring-inset ring-white/15">
              <Logo size={20} alt="" />
            </span>
            <div className="leading-tight">
              <p className="text-[12.5px] font-bold tracking-[-0.005em] text-white">
                Vickkyaku
              </p>
              <p className="text-[10px] font-semibold text-brand-400">Cashback</p>
            </div>
          </div>

          <p className="text-center text-[11px] font-medium text-ink-500 sm:text-right">
            © {new Date().getFullYear()} Vickkyaku. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px] font-medium text-ink-500">
            <Link to="#" className="transition-colors hover:text-ink-300">Terms</Link>
            <Link to="#" className="transition-colors hover:text-ink-300">Privacy</Link>
            <Link to="#" className="transition-colors hover:text-ink-300">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-[12.5px] font-medium leading-relaxed text-ink-400 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAYMENT LOGOS (inline SVG)
═══════════════════════════════════════════════════════════ */
function VisaLogo() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto">
      <text x="0" y="13" fontFamily="Arial, sans-serif" fontSize="16" fontStyle="italic" fontWeight="900" fill="#1A1F71">
        VISA
      </text>
    </svg>
  );
}
function MastercardLogo() {
  return (
    <svg viewBox="0 0 40 24" className="h-4 w-auto">
      <circle cx="14" cy="12" r="8" fill="#EB001B" />
      <circle cx="26" cy="12" r="8" fill="#F79E1B" />
      <path d="M20 5.3a8 8 0 0 1 0 13.4A8 8 0 0 1 20 5.3z" fill="#FF5F00" />
    </svg>
  );
}
function VerveLogo() {
  return (
    <svg viewBox="0 0 40 16" className="h-3.5 w-auto">
      <text x="0" y="13" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" fill="#0F3E7E">
        Verve
      </text>
    </svg>
  );
}
function PaystackLogo() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto">
      <text x="0" y="12" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#011B33">
        Paystack
      </text>
    </svg>
  );
}