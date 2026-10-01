/**
 * sessionStorage helpers for the scan-then-signup pipeline.
 * When a guest scans a QR URL, we cache the serial and redirect to signup.
 * After signup + verification, we replay the cached serial.
 */

const SCAN_KEY = 'qrcb_pending_scan';

export function setPendingScan(serial: string, sig?: string) {
  try {
    sessionStorage.setItem(SCAN_KEY, JSON.stringify({ serial, sig }));
  } catch {}
}

export function getPendingScan(): { serial: string; sig?: string } | null {
  try {
    const raw = sessionStorage.getItem(SCAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingScan() {
  try {
    sessionStorage.removeItem(SCAN_KEY);
  } catch {}
}
