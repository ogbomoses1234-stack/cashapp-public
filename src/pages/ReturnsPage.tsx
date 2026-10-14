import { Link } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';

export default function ReturnsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            Returns &amp; Refunds
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            Return Policy
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-500">
            We want you to be confident in every order. Here's what happens if
            something isn't right.
          </p>
        </header>

        {/* Eligibility */}
        <Section title="When you can return">
          <ul className="space-y-3">
            <Bullet>
              <b>Damaged on arrival</b> — the product is cracked, leaking, or physically
              broken when you receive it.
            </Bullet>
            <Bullet>
              <b>Wrong item sent</b> — the product delivered does not match what you
              ordered.
            </Bullet>
            <Bullet>
              <b>Seal does not scan</b> — the QR seal is unreadable or the code is
              rejected by the system.
            </Bullet>
            <Bullet>
              <b>Expired or tampered</b> — the product's expiry date has passed on
              arrival, or the seal has been visibly tampered with.
            </Bullet>
          </ul>
        </Section>

        {/* Time window */}
        <Section title="Return window">
          All return or dispute requests must be made within <b>7 days</b> of
          delivery. Requests after this period cannot be processed. This gives
          both you and our team time to investigate fairly.
        </Section>

        {/* How to file */}
        <Section title="How to file a return">
          <ol className="space-y-3">
            <NumberedStep n={1}>
              Go to the <b>Support &amp; Disputes</b> section in your account.
            </NumberedStep>
            <NumberedStep n={2}>
              Enter the serial number from the QR seal and describe the issue in
              detail.
            </NumberedStep>
            <NumberedStep n={3}>
              Attach a photo of the product and seal if possible — this speeds up
              review significantly.
            </NumberedStep>
            <NumberedStep n={4}>
              Submit. Our team will review and contact you within 24–48 hours.
            </NumberedStep>
          </ol>
        </Section>

        {/* What happens next */}
        <Section title="What happens next">
          Once a dispute is approved, we will offer one of the following:
          <ul className="mt-3 space-y-3">
            <Bullet><b>Replacement</b> — a new unit of the same product, shipped at our expense.</Bullet>
            <Bullet><b>Full refund</b> — the total order amount returned to your wallet or original payment method.</Bullet>
            <Bullet><b>Cashback adjustment</b> — if the issue involves a scan, we credit the wallet directly.</Bullet>
          </ul>
        </Section>

        {/* Exclusions */}
        <Section title="What's not covered">
          <ul className="space-y-3">
            <Bullet>Products without their original packaging or seal.</Bullet>
            <Bullet>Items damaged after delivery by misuse or improper storage.</Bullet>
            <Bullet>Change of mind once the seal has been opened.</Bullet>
            <Bullet>Requests made more than 7 days after delivery.</Bullet>
          </ul>
        </Section>

        {/* CTA */}
        <div className="mt-10 rounded-xl bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white">
          <h3 className="text-[18px] font-bold tracking-[-0.01em]">
            Need to return something?
          </h3>
          <p className="mt-2 text-[13px] font-medium text-white/70">
            File a dispute directly from your account — we respond within 24–48 hours.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/disputes"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-brand-600"
            >
              File a dispute
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15"
            >
              Read Help Center
            </Link>
          </div>
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
    <section className="mb-6 rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
      <h2 className="text-[16px] font-bold tracking-[-0.01em] text-ink-900">
        {title}
      </h2>
      <div className="mt-3 text-[13.5px] font-medium leading-[1.75] text-ink-600">
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

function NumberedStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-brand-50 text-[11.5px] font-bold text-brand-700">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}