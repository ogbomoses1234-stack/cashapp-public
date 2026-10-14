import { Link } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl pb-12">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
            About Vickkyaku
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[40px]">
            Rewarding every sealed pack.
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-500">
            Vickkyaku is Nigeria's cashback platform built around trust — a small
            reward, delivered instantly, every time you scan a sealed product.
          </p>
        </header>

        {/* Section: Mission */}
        <section className="mb-10 rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
          <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink-900">
            Why we exist
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.7] text-ink-600">
            Buying everyday products in Nigeria shouldn't be complicated. Yet
            consumers juggle delayed refunds, unclear pricing, and middlemen who
            inflate costs. We built Vickkyaku to change that — a single, honest
            channel where shoppers earn real cashback and sellers reach their
            customers directly.
          </p>
        </section>

        {/* Section: How it works */}
        <section className="mb-10">
          <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink-900">
            How it works
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StepCard
              number="1"
              title="Buy a sealed pack"
              body="Every Vickkyaku product carries a unique QR seal printed on the package."
            />
            <StepCard
              number="2"
              title="Scan the seal"
              body="Use our app to scan the QR code. It's verified cryptographically — no fakes."
            />
            <StepCard
              number="3"
              title="Earn instantly"
              body="Cashback lands in your wallet the moment verification succeeds."
            />
          </div>
        </section>

        {/* Section: Values */}
        <section className="mb-10 rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
          <h2 className="text-[18px] font-bold tracking-[-0.01em] text-ink-900">
            What we stand for
          </h2>
          <ul className="mt-4 space-y-3">
            <Bullet>
              <b>Transparency.</b> No hidden markups. Every amount is what you see.
            </Bullet>
            <Bullet>
              <b>Security first.</b> Every QR is HMAC-signed. Devices are tracked. Fraud
              attempts are blocked before they cost you anything.
            </Bullet>
            <Bullet>
              <b>Speed.</b> Cashback is credited the second a scan is verified —
              you never wait.
            </Bullet>
            <Bullet>
              <b>Built for Nigeria.</b> Naira-priced, Paystack-verified, bank
              withdrawals that land in 1–2 days.
            </Bullet>
          </ul>
        </section>

        {/* CTA */}
        <div className="rounded-xl bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white">
          <h3 className="text-[18px] font-bold tracking-[-0.01em]">
            Start earning today
          </h3>
          <p className="mt-2 text-[13px] font-medium text-white/70">
            Create an account, buy your first sealed pack, and scan to unlock
            instant cashback.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link to="/signup">
              <Button variant="brand" size="lg">
                Create account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="dark" size="lg">
                Browse products
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </PublicShell>
  );
}

function StepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-[13px] font-bold text-brand-700">
        {number}
      </span>
      <p className="mt-3 text-[14px] font-bold text-ink-900">{title}</p>
      <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-500">
        {body}
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 grid h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
      <span className="text-[13.5px] font-medium leading-[1.7] text-ink-600">
        {children}
      </span>
    </li>
  );
}