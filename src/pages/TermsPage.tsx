import { PublicShell } from '@/layouts/PublicShell';

const LAST_UPDATED = 'October 14, 2026';

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            Legal
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            Terms of Service
          </h1>
          <p className="mt-4 text-[13px] font-medium text-ink-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="space-y-8 rounded-xl bg-white p-6 ring-1 ring-ink-200/70 sm:p-8">
          <Section title="1. Acceptance of terms">
            By accessing or using Vickkyaku (vickkyaku.store), you agree to be
            bound by these Terms of Service. If you do not agree, do not use the
            platform.
          </Section>

          <Section title="2. Account responsibilities">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. Notify us immediately of any unauthorised use.
          </Section>

          <Section title="3. Cashback and rewards">
            Cashback is credited to your wallet upon successful verification of a
            sealed pack's QR code. Cashback is non-transferable and can only be
            withdrawn to a Nigerian bank account in your name. We reserve the
            right to reverse credits obtained through fraud or misuse.
          </Section>

          <Section title="4. Orders and payments">
            Orders placed through the platform are subject to product
            availability and verification of payment. We accept bank transfer and
            pay-on-delivery. Bank transfers require an uploaded receipt, which we
            verify before processing.
          </Section>

          <Section title="5. Disputes">
            Disputes regarding damaged, incorrect, or unverifiable products must
            be filed within 7 days of delivery or scan. We investigate each case
            fairly and respond within 24–48 hours.
          </Section>

          <Section title="6. Prohibited conduct">
            You agree not to misuse the platform, including but not limited to:
            attempting to redeem serials that you did not legitimately purchase,
            reverse engineering the QR verification system, or interfering with
            the platform's normal operation.
          </Section>

          <Section title="7. Limitation of liability">
            Vickkyaku is provided "as is". To the maximum extent permitted by
            Nigerian law, we disclaim all warranties and will not be liable for
            indirect, incidental, or consequential damages arising from your use
            of the platform.
          </Section>

          <Section title="8. Changes to these terms">
            We may update these terms from time to time. Continued use of the
            platform after changes means you accept the revised terms.
          </Section>

          <Section title="9. Contact">
            Questions about these terms? Email us at{' '}
            <a
              href="mailto:info@vickkyaku.store"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              info@vickkyaku.store
            </a>
            .
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
      <p className="mt-2 text-[13.5px] font-medium leading-[1.75] text-ink-600">
        {children}
      </p>
    </section>
  );
}
