import { get, post } from './api';
import { getStoredRefreshToken } from '@/utils/authStorage';
import type { UserProfile } from '@/types';

export interface SignupInput {
  email: string;
  password: string;
}
export interface LoginInput {
  email: string;
  password: string;
}
export interface CompleteProfileInput {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile & { mustChangePassword?: boolean };
}

export function signup(input: SignupInput) {
  return post<{ authUserId: string; email: string }>(
    '/api/public/auth/signup',
    input
  );
}

export function login(input: LoginInput) {
  return post<SessionResponse>('/api/public/auth/login', input);
}

/**
 * Exchange the stored refresh token for a new access + refresh pair.
 * Normally the axios interceptor handles this automatically on 401 —
 * call this directly only if you need a manual refresh.
 */
export function refresh() {
  const refreshToken = getStoredRefreshToken();
  return post<SessionResponse>('/api/public/auth/refresh', { refreshToken });
}

/**
 * Logout: revoke the current refresh-token family on the server,
 * then the caller should clear local state via authStore.clear().
 */
export function logout() {
  const refreshToken = getStoredRefreshToken();
  return post<{ loggedOut: true }>('/api/public/auth/logout', { refreshToken });
}

export function getMe() {
  return get<UserProfile>('/api/public/auth/me');
}

export function completeProfile(input: CompleteProfileInput) {
  return post<UserProfile>('/api/public/auth/complete-profile', input);
}