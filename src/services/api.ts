import axios, { AxiosError, AxiosInstance } from 'axios';
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

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Device fingerprint on every request ────────────────── */
api.interceptors.request.use(async (config) => {
  try {
    const fp = await getFingerprint();
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['X-Device-Fingerprint'] = fp;
  } catch {}
  return config;
});

/* ─── 401 handler ────────────────────────────────────────── */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

/* ─── Response interceptor — normalize errors ───────────── */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
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

/* ═══════════════════════════════════════════════════════════
   Typed helpers
═══════════════════════════════════════════════════════════ */

/** Returns only `data` — the common case. */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get(url, { params });
  return res.data?.data as T;
}

/** Returns `data` + `meta` — for paginated endpoints. */
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
