import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearAllStoredTokens,
} from '@/utils/authStorage';
import { getFingerprint } from '@/utils/fingerprint';
import type { ApiErrorBody } from '@/types';

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/* ═══════════════════════════════════════════════════
   REQUEST INTERCEPTOR — attach token + fingerprint
═══════════════════════════════════════════════════ */
api.interceptors.request.use(async (config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  try {
    const fp = await getFingerprint();
    config.headers = config.headers ?? {};
    (config.headers as any)['X-Device-Fingerprint'] = fp;
  } catch {
    /* non-fatal — server accepts requests without it */
  }

  return config;
});

/* ═══════════════════════════════════════════════════
   RESPONSE INTERCEPTOR — auto-save any returned tokens
═══════════════════════════════════════════════════ */
api.interceptors.response.use((response) => {
  const payload: any = response?.data;
  const access =
    payload?.data?.accessToken ??
    payload?.accessToken ??
    payload?.data?.data?.accessToken;
  if (typeof access === 'string' && access.length > 30) {
    setStoredToken(access);
  }
  const refresh =
    payload?.data?.refreshToken ??
    payload?.refreshToken ??
    payload?.data?.data?.refreshToken;
  if (typeof refresh === 'string' && refresh.length > 30) {
    setStoredRefreshToken(refresh);
  }
  return response;
});

/* ═══════════════════════════════════════════════════
   AUTH 401 HANDLER
═══════════════════════════════════════════════════ */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

/* ═══════════════════════════════════════════════════
   REFRESH LOGIC — de-duped across concurrent 401s
═══════════════════════════════════════════════════ */
let refreshPromise: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const refreshToken = getStoredRefreshToken();

      /* Bare axios — bypass our interceptors to avoid recursion */
      const res = await axios.post(
        `${BASE_URL}/api/public/auth/refresh`,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true, timeout: 15000 }
      );

      const data = res.data?.data ?? res.data;
      const newAccess = data?.accessToken;
      const newRefresh = data?.refreshToken;

      if (typeof newAccess === 'string') setStoredToken(newAccess);
      if (typeof newRefresh === 'string') setStoredRefreshToken(newRefresh);

      return typeof newAccess === 'string' ? newAccess : null;
    } catch {
      clearAllStoredTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Endpoints we should NOT auto-refresh on — avoids infinite loops */
function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('/api/public/auth/refresh') ||
    url.includes('/api/public/auth/login') ||
    url.includes('/api/public/auth/signup') ||
    url.includes('/api/public/otp/')
  );
}

/* ═══════════════════════════════════════════════════
   RESPONSE ERROR INTERCEPTOR
═══════════════════════════════════════════════════ */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    /* ─── Try to refresh on 401 ─── */
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !shouldSkipRefresh(original.url)
    ) {
      original._retry = true;
      const newToken = await attemptRefresh();

      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }

    /* ─── Normalize the error ─── */
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) onUnauthorized?.();
      const code = data?.error?.code ?? 'UNKNOWN_ERROR';
      const message = data?.error?.message ?? defaultMessage(status);
      throw new ApiClientError(code, message, status, data?.error?.details);
    }
    if (error.code === 'ECONNABORTED') {
      throw new ApiClientError('TIMEOUT', 'Request timed out. Check your connection.', 0);
    }
    throw new ApiClientError('NETWORK_ERROR', 'Cannot reach the server. Is it running?', 0);
  }
);

function defaultMessage(status: number): string {
  if (status === 400) return 'Invalid request';
  if (status === 401) return 'Please log in';
  if (status === 403) return 'Access denied';
  if (status === 404) return 'Not found';
  if (status === 409) return 'Conflict';
  if (status === 413) return 'File too large';
  if (status === 415) return 'Unsupported file type';
  if (status === 429) return 'Too many requests — slow down';
  if (status >= 500) return 'Server error — please try again';
  return 'Something went wrong';
}

/* ═══════════════════════════════════════════════════
   TYPED HELPERS
═══════════════════════════════════════════════════ */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get(url, { params });
  return res.data?.data as T;
}

export async function getWithMeta<T, M = Record<string, unknown>>(
  url: string,
  params?: Record<string, unknown>
): Promise<{ data: T; meta?: M }> {
  const res = await api.get(url, { params });
  return {
    data: res.data?.data as T,
    meta: res.data?.meta as M | undefined,
  };
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post(url, body);
  return res.data?.data as T;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch(url, body);
  return res.data?.data as T;
}

export async function del<T>(url: string): Promise<T> {
  const res = await api.delete(url);
  return res.data?.data as T;
}