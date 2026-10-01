import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScannerLayout } from '@/layouts/ScannerLayout';
import { Button } from '@/components/ui/Button';
import { useQrScanner } from '@/hooks/useQrScanner';
import { parseQrPayload } from '@/utils/qrParser';
import { dispatchSerial } from '@/services/scan.service';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';

const SCANNER_ID = 'qrcb-staff-scanner';

export default function StockScanPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);
  const [lastSerial, setLastSerial] = useState<string | null>(null);

  const { status, error, isScanning, isStarting, hasTorch, torchOn, start, stop, toggleTorch } =
    useQrScanner({
      elementId: SCANNER_ID,
      debounceMs: 1200,
      onScan: async (decodedText) => {
        const parsed = parseQrPayload(decodedText);
        if (!parsed) {
          toast.error('Not a Vickkyaku seal');
          return;
        }
        if (busy) return;

        setBusy(true);
        try {
          await dispatchSerial(parsed);
          setScannedCount((n) => n + 1);
          setLastSerial(parsed.serialNumber);
          toast.success(`Logged · #${parsed.serialNumber}`);

          /* Haptic feedback on supported devices */
          if ('vibrate' in navigator) navigator.vibrate?.(40);
        } catch (e) {
          const err = e as ApiClientError;
          toast.error(err.message);
        } finally {
          setTimeout(() => setBusy(false), 350);
        }
      },
    });

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
            onClick={() => navigate('/staff/terminal')}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur"
            aria-label="Close"
          >
            ✕
          </button>
          <span className="text-[13.5px] font-bold text-white">
            Stock-out scanner
          </span>
          {hasTorch ? (
            <button
              onClick={toggleTorch}
              className={`grid h-10 w-10 place-items-center rounded-2xl backdrop-blur transition ${
                torchOn
                  ? 'bg-violet-400 text-[#04140d]'
                  : 'bg-white/10 text-white'
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
            SCAN COUNTER BADGE
        ═══════════════════════════════════════════════════ */}
        {scannedCount > 0 && (
          <div className="absolute left-1/2 top-24 z-10 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-2xl bg-violet-500/25 px-4 py-2 ring-1 ring-inset ring-violet-400/40 backdrop-blur">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-400 text-[10px] font-black text-[#04140d]">
                {scannedCount}
              </span>
              <p className="text-[11.5px] font-black uppercase tracking-widest text-violet-100">
                Scanned this session
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            SCANNER
        ═══════════════════════════════════════════════════ */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
          <div className="relative h-72 w-72 overflow-hidden rounded-3xl bg-black">
            <div id={SCANNER_ID} className="h-full w-full" />

            {/* Corner brackets */}
            <span className="pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-violet-400" />
            <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-violet-400" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-violet-400" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-violet-400" />

            {isScanning && (
              <span className="pointer-events-none absolute left-4 right-4 h-[2.5px] animate-laser rounded-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            )}

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

          <div className="max-w-[280px] text-center">
            <p className="text-[13px] font-semibold text-slate-300">
              {isScanning
                ? 'Fit the tracking code inside the frame'
                : status === 'error'
                  ? 'Tap "Try again" below'
                  : 'Setting up camera…'}
            </p>
            {lastSerial && (
              <p className="mt-2 font-mono text-[11px] tracking-wider text-violet-300">
                Last · #{lastSerial}
              </p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            BOTTOM ACTIONS
        ═══════════════════════════════════════════════════ */}
        <div className="absolute bottom-0 left-0 right-0 z-10 space-y-2.5 bg-gradient-to-t from-ink-900 via-ink-900/90 to-transparent px-5 pb-10 pt-5">
          {status === 'error' ? (
            <Button variant="primary" size="lg" block onClick={() => start()}>
              Try again
            </Button>
          ) : isScanning ? (
            <Button
              variant="dark"
              size="lg"
              block
              onClick={() => navigate('/staff/terminal')}
            >
              Back to terminal
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => start()}
              loading={isStarting}
              style={{
                background: 'linear-gradient(135deg,#a78bfa,#6d28d9)',
                color: 'white',
              }}
            >
              Activate camera
            </Button>
          )}
        </div>
      </div>
    </ScannerLayout>
  );
}
