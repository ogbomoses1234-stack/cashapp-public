import { post } from './api';
import type { UserProfile } from '@/types';

export interface VerifyOtpResponse {
  verified: true;
  user: UserProfile & { mustChangePassword?: boolean };
  accessToken: string;
  refreshToken: string;
}

export function verifyOtp(input: { email: string; code: string }) {
  return post<VerifyOtpResponse>('/api/public/otp/verify', input);
}

export function resendOtp(input: { email: string }) {
  return post<{ sent: true }>('/api/public/otp/resend', input);
}