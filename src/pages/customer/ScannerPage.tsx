import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { Button } from '@/components/ui/Button';
import { useQrScanner } from '@/hooks/useQrScanner';
import { parseQrPayload } from '@/utils/qrParser';
import { redeemScan } from '@/services/scan.service';
import { useAuthStore } from '@/store/authStore';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';
import { formatNaira } from '@/utils/format';

const SCANNER_ID = 'qrcb-customer-scanner';

export default function ScannerPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState(false);

  const { status, error, isScanning, isStarting, hasTorch, torchOn, start, stop, toggleTorch } =
    useQrScanner({
      elementId: SCANNER_ID,
      debounceMs: 2500,
      onScan: async (decodedText) => {
        const parsed = parseQrPayload(decodedText);
        if (!parsed) {
          toast.error('This QR code is not from Vickkyaku');
          return;
        }

        if (busy) return;
        setBusy(true);
        try {
          await stop();
          const res = await redeemScan(parsed);
          toast.success(`+${formatNaira(res.credited)} credited!`);
          navigate(
            `/scan-result?status=success&serial=${parsed.serialNumber}&credited=${res.credited}`
          );
        } catch (e) {
          const err = e as ApiClientError;
          navigate(
            `/scan-result?status=error&serial=${parsed.serialNumber}&message=${encodeURIComponent(
              err.message
            )}`
          );
        } finally {
          setBusy(false);
        }
      },
    });

  /* Guard: customer only */
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
    if (user?.role === 'staff') navigate('/staff/scan', { replace: true });
  }, [user, navigate]);

  /* Auto-start on mount */
  useEffect(() => {
    const t = setTimeout(() => start(), 150);
    return () => {
      clearTimeout(t);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScannerLayout>
      <div className="relative flex min-h-screen flex-col">
        {/* ═══════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════ */}
        <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pb-4 pt-14">
          <button
            onClick={() => navigate(-1)}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur"
            aria-label="Close"
          >
            ✕
          </button>
          <span className="text-[13.5px] font-bold text-white">
            Scan product QR code
          </span>
          {hasTorch ? (
            <button
              onClick={toggleTorch}
              className={`grid h-10 w-10 place-items-center rounded-2xl backdrop-blur transition ${
                torchOn ? 'bg-brand-400 text-[#04140d]' : 'bg-white/10 text-white'
              }`}
              aria-label={torchOn ? 'Turn off flash' : 'Turn on flash'}
            >
              ⚡
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
        </header>

        {/* ═══════════════════════════════════════════════════
            SCANNER VIEWPORT
        ═══════════════════════════════════════════════════ */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
          {/* Scanner container — html5-qrcode injects the <video> here */}
          <div className="relative h-72 w-72 overflow-hidden rounded-3xl bg-black">
            <div id={SCANNER_ID} className="h-full w-full" />

            {/* Corner brackets overlay */}
            <span className="pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-brand-400" />
            <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-brand-400" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-brand-400" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-brand-400" />

            {/* Laser sweep — only while scanning */}
            {isScanning && (
              <span className="pointer-events-none absolute left-4 right-4 h-[2.5px] animate-laser rounded-full bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
            )}

            {/* Overlay: starting */}
            {isStarting && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 text-center">
                <div>
                  <span className="mx-auto mb-2 block h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  <p className="text-[12px] font-semibold text-white/80">
                    Starting camera…
                  </p>
                </div>
              </div>
            )}

            {/* Overlay: error */}
            {status === 'error' && error && (
              <div className="absolute inset-0 grid place-items-center bg-black/85 p-4 text-center">
                <div>
                  <span className="mb-2 block text-3xl">📷</span>
                  <p className="text-[12.5px] font-bold text-white">
                    Camera unavailable
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-white/70">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Instruction */}
          <p className="max-w-[280px] text-center text-[13px] font-semibold text-slate-400">
            {isScanning
              ? 'Fit the QR seal inside the frame'
              : status === 'error'
                ? 'Tap "Try again" below'
                : 'Setting up camera…'}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════
            BOTTOM ACTION
        ═══════════════════════════════════════════════════ */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-ink-900 via-ink-900/90 to-transparent px-5 pb-10 pt-5">
          {status === 'error' ? (
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => start()}
            >
              Try again
            </Button>
          ) : isScanning ? (
            <Button variant="dark" size="lg" block onClick={() => stop()}>
              Stop scanning
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => start()}
              loading={isStarting}
            >
              Activate camera
            </Button>
          )}
        </div>
      </div>
    </ScannerLayout>
  );
}
