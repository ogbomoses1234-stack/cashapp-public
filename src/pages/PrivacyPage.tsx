import { PublicShell } from '@/layouts/PublicShell';

const LAST_UPDATED = 'October 14, 2026';

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            Legal
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            Privacy Notice
          </h1>
          <p className="mt-4 text-[13px] font-medium text-ink-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="space-y-8 rounded-xl bg-white p-6 ring-1 ring-ink-200/70 sm:p-8">
          <Section title="What we collect">
            To operate Vickkyaku we collect the following information:
            <ul className="mt-3 space-y-2">
              <Bullet>Your email address and phone number (for account verification and support).</Bullet>
              <Bullet>Your full name and delivery address (for order fulfilment).</Bullet>
              <Bullet>Your bank account details (for withdrawals only).</Bullet>
              <Bullet>Device fingerprint and session metadata (for fraud prevention).</Bullet>
              <Bullet>Order history, scan history, and transaction records.</Bullet>
            </ul>
          </Section>

          <Section title="How we use it">
            We use your information to:
            <ul className="mt-3 space-y-2">
              <Bullet>Process orders and deliver products to your address.</Bullet>
              <Bullet>Credit cashback to your wallet and process withdrawals.</Bullet>
              <Bullet>Verify your identity and prevent fraudulent scans or accounts.</Bullet>
              <Bullet>Send transactional emails (OTP codes, order updates, withdrawal results).</Bullet>
              <Bullet>Respond to support requests and disputes.</Bullet>
            </ul>
          </Section>

          <Section title="How we protect it">
            Passwords are hashed with argon2id. Sessions are tied to device
            fingerprints. Every QR code is HMAC-signed and cross-verified on the
            server. Bank account numbers are verified via Paystack before being
            saved. We never store card details — all card payments go directly
            through our payment provider.
          </Section>

          <Section title="Who we share it with">
            We share your information only with:
            <ul className="mt-3 space-y-2">
              <Bullet><b>Paystack</b> — for bank account verification and payouts.</Bullet>
              <Bullet><b>SendGrid</b> — for transactional email delivery.</Bullet>
              <Bullet><b>Courier partners</b> — for order delivery.</Bullet>
            </ul>
            We never sell your data to third parties.
          </Section>

          <Section title="Your rights">
            Under the Nigeria Data Protection Regulation (NDPR), you have the
            right to:
            <ul className="mt-3 space-y-2">
              <Bullet>Access the personal data we hold about you.</Bullet>
              <Bullet>Request correction of inaccurate data.</Bullet>
              <Bullet>Request deletion of your account and associated data.</Bullet>
              <Bullet>Withdraw consent for non-essential communication at any time.</Bullet>
            </ul>
            To exercise any of these, email us at{' '}
            <a
              href="mailto:info@vickkyaku.store"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              info@vickkyaku.store
            </a>
            .
          </Section>

          <Section title="Cookies">
            We use a minimal set of cookies and local storage to keep you logged
            in and to remember your cart. We do not use third-party tracking
            cookies for advertising.
          </Section>

          <Section title="Retention">
            Account data is retained while your account is active. Order and
            transaction records are kept for 7 years for legal and tax purposes.
            Audit logs are kept for 180 days. You may request full deletion at
            any time by contacting us.
          </Section>

          <Section title="Changes to this notice">
            We may update this Privacy Notice from time to time. Material changes
            will be announced on the platform or by email.
          </Section>
        </div>
      </article>
    </PublicShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[15px] font-bold tracking-[-0.005em] text-ink-900">
        {title}
      </h2>
      <div className="mt-2 text-[13.5px] font-medium leading-[1.75] text-ink-600">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 grid h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
      <span>{children}</span>
    </li>
  );
}