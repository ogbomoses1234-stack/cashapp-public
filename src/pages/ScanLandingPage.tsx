import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { setPendingScan } from '@/utils/sessionCache';
import { redeemScan } from '@/services/scan.service';
import { Button } from '@/components/ui/Button';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { ApiClientError } from '@/services/api';
import { formatNaira } from '@/utils/format';

export default function ScanLandingPage() {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const [params] = useSearchParams();
  const sig = params.get('sig') ?? '';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [state, setState] = useState<'idle' | 'redeeming' | 'success' | 'error' | 'blocked'>('idle');
  const [message, setMessage] = useState('');
  const [credited, setCredited] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!serialNumber) return;

    if (!user) {
      setPendingScan(serialNumber, sig);
      navigate('/signup', { replace: true });
      return;
    }

    if (user.role === 'staff') {
      setState('blocked');
      return;
    }

    setState('redeeming');
    redeemScan({ serialNumber, sig })
      .then((res) => {
        setCredited(res.credited);
        setState('success');
      })
      .catch((e) => {
        const err = e as ApiClientError;
        setMessage(err.message);
        setState('error');
      });
  }, [hydrated, user, serialNumber, sig, navigate]);

  return (
    <ScannerLayout>
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          {state === 'redeeming' && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 animate-spin-slow rounded-full border-4 border-white/10 border-t-brand-400" />
              <h2 className="text-2xl font-black tracking-tight">Verifying your seal…</h2>
              <p className="mt-2 text-sm text-slate-400">Serial · {serialNumber}</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/5 text-6xl shadow-[0_0_0_1.5px_rgba(16,185,129,.4),0_0_70px_rgba(16,185,129,.3)]">
                ✅
              </div>
              <h2 className="text-3xl font-black tracking-tight">Success!</h2>
              <p className="mt-3 text-sm font-medium text-slate-400">
                {formatNaira(credited ?? '100')} has been credited to your wallet.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-500/15 px-5 py-3 text-sm font-extrabold text-brand-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,.3)]">
                💰 + {formatNaira(credited ?? '100')}
              </div>
              <div className="mt-8 flex flex-col gap-2.5">
                <Button variant="primary" size="lg" block onClick={() => navigate('/wallet')}>
                  View Wallet
                </Button>
                <Button variant="dark" size="lg" block onClick={() => navigate('/scan')}>
                  Scan Another Pack
                </Button>
              </div>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-600/0 text-6xl shadow-[0_0_0_1.5px_rgba(245,158,11,.4),0_0_60px_rgba(245,158,11,.25)]">
                ⚠️
              </div>
              <h2 className="text-2xl font-black tracking-tight">Could not claim</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
                {message}
              </p>
              <div className="mt-8 flex flex-col gap-2.5">
                <Button variant="primary" size="lg" block onClick={() => navigate('/disputes')}>
                  File Dispute Report
                </Button>
                <Button variant="dark" size="lg" block onClick={() => navigate('/scan')}>
                  Exit to Store
                </Button>
              </div>
            </>
          )}

          {state === 'blocked' && (
            <>
              <div className="mx-auto mb-6 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-rose-400/25 to-rose-600/0 text-6xl shadow-[0_0_0_1.5px_rgba(244,63,94,.4),0_0_60px_rgba(244,63,94,.25)]">
                ⛔
              </div>
              <h2 className="text-2xl font-black tracking-tight">Action Prohibited</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-slate-400">
                Logged-in Staff / Seller accounts cannot claim consumer cashback rewards.
              </p>
              <div className="mt-8">
                <Button variant="dark" size="lg" block onClick={() => navigate('/staff/terminal')}>
                  Back to Terminal
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </ScannerLayout>
  );
}
