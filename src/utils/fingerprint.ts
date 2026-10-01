/**
 * Stable device fingerprint derived from browser features.
 * Used by the backend to bind sessions and hard-block deactivated devices.
 *
 * NOT cryptographically secret — it's a stable identifier, not a credential.
 */

let cached: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cached) return cached;

  const parts = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') ?? '',
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? '',
    navigator.platform,
    // Per-browser stable token
    getOrCreateDeviceToken(),
  ];

  const data = parts.join('|');
  const buf = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  cached = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return cached;
}

function getOrCreateDeviceToken(): string {
  const KEY = 'qrcb_device_token';
  try {
    let token = localStorage.getItem(KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(KEY, token);
    }
    return token;
  } catch {
    return 'no-storage';
  }
}
