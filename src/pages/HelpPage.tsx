import { Link } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';

const FAQ = [
  {
    q: 'How do I earn cashback?',
    a: 'Buy any product with a sealed QR pack from our store. Scan the QR code with the app — cashback is credited instantly to your wallet once verified.',
  },
  {
    q: 'How do I shop on Vickkyaku?',
    a: 'Browse products at vickkyaku.store, add items to your cart, and check out with bank transfer or pay-on-delivery. Your delivery address is filled from your profile.',
  },
  {
    q: 'What delivery options do you offer?',
    a: 'We deliver across Nigeria. Standard delivery typically takes 2–5 business days depending on your state. You will see the delivery details at checkout.',
  },
  {
    q: 'How do I return a product?',
    a: 'If your order arrives damaged or incorrect, file a dispute within 7 days. Our team reviews the case and either replaces the item or issues a full refund.',
  },
  {
    q: 'How long does a withdrawal take?',
    a: 'Withdrawals are processed within 1–2 business days. They settle directly into your verified Nigerian bank account.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. Sessions are tied to your device, passwords are hashed with argon2id, and we never store card details. See our Privacy Notice for details.',
  },
  {
    q: 'What if a QR seal does not scan?',
    a: 'File a dispute from the Support & Disputes section with the serial number and, if possible, a photo of the seal. We investigate and typically resolve within 24 hours.',
  },
  {
    q: 'How do I contact support?',
    a: 'Use the live chat from your account or email info@vickkyaku.store. We reply within a few hours during business days.',
  },
];

export default function HelpPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            Help Center
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            How can we help?
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-500">
            Answers to the most common questions. Still stuck? Reach out from
            live chat or email us.
          </p>
        </header>

        {/* FAQ */}
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl bg-white p-5 ring-1 ring-ink-200/70 transition-colors open:ring-ink-300"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[14.5px] font-semibold tracking-[-0.005em] text-ink-900 marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-ink-50 text-ink-500 transition-transform group-open:rotate-45">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-[13.5px] font-medium leading-[1.7] text-ink-500">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-10 rounded-xl bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white">
          <h3 className="text-[18px] font-bold tracking-[-0.01em]">
            Still need help?
          </h3>
          <p className="mt-2 text-[13px] font-medium text-white/70">
            Our support team replies within a few hours during business days.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-brand-600"
            >
              Start a chat
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15"
            >
              Contact us
            </Link>
          </div>
        </div>
      </article>
    </PublicShell>
  );
}