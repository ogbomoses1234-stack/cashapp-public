import { post } from './api';

export function verifyOtp(input: { email: string; code: string }) {
  return post<{ verified: true }>('/api/public/otp/verify', input);
}

export function resendOtp(input: { email: string }) {
  return post<{ sent: true }>('/api/public/otp/resend', input);
}
