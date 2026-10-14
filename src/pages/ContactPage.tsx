import { Link } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';

export default function ContactPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            Contact Us
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            We're here to help.
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-500">
            Pick whichever channel works best — chat for fast questions, email
            for detailed enquiries.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Chat card */}
          <Link
            to="/chat"
            className="group block rounded-xl bg-white p-6 ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <h2 className="mt-4 text-[16px] font-bold tracking-[-0.01em] text-ink-900">
              Live chat
            </h2>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-500">
              Fastest way to reach us. Available inside your account — we
              usually reply within a few hours.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600">
              Open chat
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>

          {/* Email card */}
          <a
            href="mailto:info@vickkyaku.store"
            className="group block rounded-xl bg-white p-6 ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </span>
            <h2 className="mt-4 text-[16px] font-bold tracking-[-0.01em] text-ink-900">
              Email us
            </h2>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-500">
              Best for detailed enquiries, partnerships, or anything that needs
              documentation.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600">
              info@vickkyaku.store
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>

        {/* Response times */}
        <div className="mt-8 rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-ink-500">
            Response times
          </h3>
          <ul className="mt-4 space-y-3">
            <Bullet label="Live chat" value="A few hours (business days)" />
            <Bullet label="Email" value="Within 24 hours" />
            <Bullet label="Disputes" value="Reviewed within 24–48 hours" />
          </ul>
        </div>
      </article>
    </PublicShell>
  );
}

function Bullet({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-ink-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-[13.5px] font-semibold text-ink-900">{label}</span>
      <span className="text-[12.5px] font-medium text-ink-500">{value}</span>
    </li>
  );
}