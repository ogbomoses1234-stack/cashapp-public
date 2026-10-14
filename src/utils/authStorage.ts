/**
 * Token storage for cross-domain deployments.
 *
 * On same-domain deployments (production with vickkyaku.com), the backend
 * sets httpOnly cookies and this file is unused.
 *
 * On cross-domain deployments (localhost, sslip.io), we store tokens in
 * localStorage and send them:
 *   - accessToken  →  Authorization: Bearer <token>
 *   - refreshToken →  JSON body { refreshToken }
 *
 * The backend accepts BOTH.
 */

const ACCESS_KEY = 'qrcb_access_token';
const REFRESH_KEY = 'qrcb_refresh_token';

/* ═══════════════════════════════════════════════════
   ACCESS TOKEN
═══════════════════════════════════════════════════ */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, token);
  } catch {}
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
  } catch {}
}

/* ═══════════════════════════════════════════════════
   REFRESH TOKEN
═══════════════════════════════════════════════════ */
export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setStoredRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_KEY, token);
  } catch {}
}

export function clearStoredRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

/* ═══════════════════════════════════════════════════
   BOTH
═══════════════════════════════════════════════════ */
export function clearAllStoredTokens(): void {
  clearStoredToken();
  clearStoredRefreshToken();
}