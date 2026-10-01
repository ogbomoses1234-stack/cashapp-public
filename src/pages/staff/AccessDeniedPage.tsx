import { useNavigate } from 'react-router-dom';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { Button } from '@/components/ui/Button';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <ScannerLayout>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Blocked icon */}
        <div className="mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-rose-400/25 to-rose-600/0 text-6xl shadow-[0_0_0_1.5px_rgba(244,63,94,.4),0_0_60px_rgba(244,63,94,.25)]">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">
          Access Denied
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
          Your seller role cannot access the customer wallet or claim consumer
          cashback rewards. This is a security restriction.
        </p>

        <div className="mt-6 rounded-2xl bg-white/[.06] px-4 py-3 ring-1 ring-inset ring-white/10">
          <p className="text-[10.5px] font-black uppercase tracking-wider text-rose-300">
            Staff account
          </p>
          <p className="mt-1 text-[11.5px] font-semibold text-white/70">
            Sellers scan to log stock-outs, not to claim rewards
          </p>
        </div>

        <div className="mt-8 w-full max-w-sm space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => navigate('/staff/terminal')}
            style={{
              background: 'linear-gradient(135deg,#a78bfa,#6d28d9)',
              color: 'white',
            }}
          >
            Back to my terminal
          </Button>
          <Button
            variant="dark"
            size="lg"
            block
            onClick={() => navigate('/staff/stock')}
          >
            View my stock list
          </Button>
        </div>
      </div>
    </ScannerLayout>
  );
}
