/**
 * Stable device fingerprint derived from browser features.
 * Used by the backend to bind sessions and hard-block deactivated devices.
 *
 * NOT cryptographically secret — it's a stable identifier, not a credential.
 *
 * NOTE: This file deliberately avoids:
 *   - crypto.randomUUID()  → only available on HTTPS
 *   - crypto.subtle.digest() → only available on HTTPS
 * Instead it uses crypto.getRandomValues() (available everywhere) and
 * a fast non-crypto hash (cyrb53).
 */

let cached: string | null = null;

/* ──────────────────────────────────────────────────────────
   Non-crypto hash (cyrb53) — works on HTTP and HTTPS
   ────────────────────────────────────────────────────────── */
function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(16, '0');
}

/* ──────────────────────────────────────────────────────────
   UUID v4 generator that works on HTTP (uses getRandomValues)
   ────────────────────────────────────────────────────────── */
function uuidv4(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/* ──────────────────────────────────────────────────────────
   Canvas fingerprint (subtle device-level rendering diff)
   ────────────────────────────────────────────────────────── */
function getCanvasToken(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 40);
    ctx.fillStyle = '#069';
    ctx.fillText('QR CashBack Connect', 2, 2);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('QR CashBack Connect', 4, 17);
    return canvas.toDataURL().slice(-64);
  } catch {
    return 'canvas-error';
  }
}

/* ──────────────────────────────────────────────────────────
   Persistent device token (stable across visits)
   ────────────────────────────────────────────────────────── */
function getOrCreateDeviceToken(): string {
  const KEY = 'qrcb_device_token';
  try {
    let token = localStorage.getItem(KEY);
    if (!token) {
      token = uuidv4();
      localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    return 'no-storage';
  }
}

/* ──────────────────────────────────────────────────────────
   Public API — same signature as before (async)
   ────────────────────────────────────────────────────────── */
export async function getFingerprint(): Promise<string> {
  if (cached) return cached;

  const parts = [
    navigator.userAgent,
    navigator.language,
    (navigator.languages ?? []).join(','),
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency ?? ''),
    (navigator as { platform?: string }).platform ?? '',
    getCanvasToken(),
    getOrCreateDeviceToken(),
  ];

  const data = parts.join('|');
  cached = cyrb53(data) + cyrb53(data, 0x9e3779b9);
  return cached;
}

/* ──────────────────────────────────────────────────────────
   Aliases for compatibility
   ────────────────────────────────────────────────────────── */
export const computeFingerprint = getFingerprint;
export default getFingerprint;
