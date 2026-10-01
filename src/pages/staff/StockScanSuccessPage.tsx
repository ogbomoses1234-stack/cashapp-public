import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { Button } from '@/components/ui/Button';

export default function StockScanSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const serial = params.get('serial') ?? '';

  return (
    <ScannerLayout>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Success ring */}
        <div className="mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-violet-400/30 to-violet-600/5 text-6xl shadow-[0_0_0_1.5px_rgba(139,92,246,.45),0_0_70px_rgba(139,92,246,.3)]">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          Added to your stock
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
          Serial status changed from <b className="text-violet-300">Created</b> to{' '}
          <b className="text-violet-300">Dispatched</b>. This unit is now
          traceable to your seller ID.
        </p>

        {serial && (
          <div className="mt-6 rounded-2xl bg-white/[.06] px-5 py-2.5 font-mono text-[12.5px] font-black tracking-widest text-white ring-1 ring-inset ring-white/10">
            #{serial}
          </div>
        )}

        <div className="mt-8 w-full max-w-sm space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => navigate('/staff/scan')}
            style={{
              background: 'linear-gradient(135deg,#a78bfa,#6d28d9)',
              color: 'white',
            }}
          >
            Scan next product
          </Button>
          <Button
            variant="dark"
            size="lg"
            block
            onClick={() => navigate('/staff/terminal')}
          >
            Back to terminal
          </Button>
        </div>
      </div>
    </ScannerLayout>
  );
}
