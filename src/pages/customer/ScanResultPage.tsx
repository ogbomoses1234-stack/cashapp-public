import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/utils/format';

export default function ScanResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const status = params.get('status') ?? 'error';
  const serial = params.get('serial') ?? '';
  const message = params.get('message') ?? 'Something went wrong.';

  /* Parse credited defensively */
  const rawCredited = params.get('credited');
  const creditedNum = (() => {
    if (!rawCredited) return 100;
    const n = parseFloat(rawCredited);
    return isFinite(n) && n > 0 ? n : 100;
  })();
  const credited = creditedNum.toFixed(2);

  /* ═══════════════════════════════════════════════════════
     SUCCESS
  ═══════════════════════════════════════════════════════ */
  if (status === 'success') {
    return (
      <ScannerLayout>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/5 text-6xl shadow-[0_0_0_1.5px_rgba(16,185,129,.4),0_0_70px_rgba(16,185,129,.3)]">
            ✅
          </div>

          <h1 className="text-3xl font-black tracking-tight">Success!</h1>

          <p className="mt-3 text-sm font-medium text-slate-400">
            <b className="text-brand-300">{formatNaira(credited)}</b> has been
            credited to your wallet.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-500/15 px-5 py-3 text-sm font-extrabold text-brand-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,.3)]">
            💰 + {formatNaira(credited)}
          </div>

          <div className="mt-8 w-full max-w-sm space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => navigate('/wallet')}
            >
              View Wallet
            </Button>
            <Button
              variant="dark"
              size="lg"
              block
              onClick={() => navigate('/scan')}
            >
              Scan Another Pack
            </Button>
          </div>

          {serial && (
            <p className="mt-6 font-mono text-[11px] tracking-wider text-slate-500">
              SERIAL · {serial}
            </p>
          )}
        </div>
      </ScannerLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════
     ALREADY REDEEMED — detect and show friendly UX
  ═══════════════════════════════════════════════════════ */
  const isAlreadyRedeemed =
    /already|claimed|redeemed/i.test(message) ||
    message.includes('QR_ALREADY_REDEEMED');

  if (isAlreadyRedeemed) {
    return (
      <ScannerLayout>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-600/0 text-6xl shadow-[0_0_0_1.5px_rgba(245,158,11,.4),0_0_60px_rgba(245,158,11,.25)]">
            ⚠️
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            Already claimed
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
            This cash-back voucher has already been claimed. If you believe this
            is an error, you can file a dispute.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[.06] px-4 py-2 font-mono text-[11.5px] tracking-wider text-slate-400 ring-1 ring-inset ring-white/10">
            SERIAL · {serial || '—'}
          </div>

          <div className="mt-8 w-full max-w-sm space-y-2.5">
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => navigate('/disputes')}
            >
              File dispute report
            </Button>
            <Button
              variant="dark"
              size="lg"
              block
              onClick={() => navigate('/scan')}
            >
              Scan another pack
            </Button>
          </div>
        </div>
      </ScannerLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════
     GENERIC ERROR
  ═══════════════════════════════════════════════════════ */
  return (
    <ScannerLayout>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-rose-400/25 to-rose-600/0 text-6xl shadow-[0_0_0_1.5px_rgba(244,63,94,.4),0_0_60px_rgba(244,63,94,.25)]">
          ⚠️
        </div>

        <h1 className="text-2xl font-black tracking-tight">Could not claim</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
          {message}
        </p>

        <div className="mt-8 w-full max-w-sm space-y-2.5">
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => navigate('/scan')}
          >
            Try another pack
          </Button>
          <Button
            variant="dark"
            size="lg"
            block
            onClick={() => navigate('/')}
          >
            Exit to store
          </Button>
        </div>
      </div>
    </ScannerLayout>
  );
}
