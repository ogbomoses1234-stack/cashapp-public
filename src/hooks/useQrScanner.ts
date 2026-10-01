import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

/* ═══════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════ */
type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'stopping' | 'error';

interface UseQrScannerOptions {
  /** Container element id (must exist in the DOM) */
  elementId: string;
  /** Fired when a QR is successfully decoded */
  onScan: (decodedText: string) => void;
  /** Debounce window in ms — prevents duplicate fires on the same QR */
  debounceMs?: number;
}

/* ═══════════════════════════════════════════════════════════
   Hook
═══════════════════════════════════════════════════════════ */
export function useQrScanner({
  elementId,
  onScan,
  debounceMs = 2000,
}: UseQrScannerOptions) {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ text: string; at: number } | null>(null);
  const onScanRef = useRef(onScan);

  /* Keep the callback fresh without re-running the effect */
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  /* ─── Cleanup on unmount ───────────────────────────────── */
  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {}).finally(() => {
          try {
            s.clear();
          } catch {}
        });
        scannerRef.current = null;
      }
    };
  }, []);

  /* ─── Start scanner ────────────────────────────────────── */
  const start = useCallback(async () => {
    /* Already running? ignore */
    if (scannerRef.current || status === 'scanning') return;

    setError(null);
    setStatus('starting');

    /* Guard: container must exist */
    const container = document.getElementById(elementId);
    if (!container) {
      setError('Scanner container not found');
      setStatus('error');
      return;
    }

    /* Guard: getUserMedia support */
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera access requires HTTPS or localhost. If you are on a LAN IP, use https://'
      );
      setStatus('error');
      return;
    }

    const scanner = new Html5Qrcode(elementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.75;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          /* ─── Debounce duplicate scans ─────────────── */
          const now = Date.now();
          const last = lastScanRef.current;
          if (last && last.text === decodedText && now - last.at < debounceMs) {
            return;
          }
          lastScanRef.current = { text: decodedText, at: now };
          onScanRef.current(decodedText);
        },
        () => {
          /* Per-frame failures are normal — ignore */
        }
      );

      setStatus('scanning');

      /* Detect torch support (mobile rear cameras have it) */
      try {
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Camera unavailable';

      if (/permission|denied|NotAllowed/i.test(msg)) {
        setError('Camera permission denied. Enable it in your browser settings.');
      } else if (/no camera|NotFound/i.test(msg)) {
        setError('No camera found on this device.');
      } else if (/NotReadable|in use/i.test(msg)) {
        setError('Camera is already in use by another app.');
      } else {
        setError(msg);
      }
      setStatus('error');
      scannerRef.current = null;
    }
  }, [elementId, debounceMs, status]);

  /* ─── Stop scanner ─────────────────────────────────────── */
  const stop = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) {
      setStatus('idle');
      return;
    }
    setStatus('stopping');
    try {
      await s.stop();
      s.clear();
    } catch {}
    scannerRef.current = null;
    setHasTorch(false);
    setTorchOn(false);
    setStatus('idle');
  }, []);

  /* ─── Toggle torch ─────────────────────────────────────── */
  const toggleTorch = useCallback(async () => {
    const s = scannerRef.current;
    if (!s || !hasTorch) return;
    try {
      await s.applyVideoConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      });
      setTorchOn((v) => !v);
    } catch {}
  }, [hasTorch, torchOn]);

  return {
    status,
    error,
    isScanning: status === 'scanning',
    isStarting: status === 'starting',
    hasTorch,
    torchOn,
    start,
    stop,
    toggleTorch,
  };
}
