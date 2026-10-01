import { get, post } from './api';
import type { UserProfile } from '@/types';

export interface SignupInput { email: string; password: string; }
export interface LoginInput  { email: string; password: string; }
export interface CompleteProfileInput {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
}

export function signup(input: SignupInput) {
  return post<{ authUserId: string; email: string }>('/api/public/auth/signup', input);
}

export function login(input: LoginInput) {
  return post<{ user: UserProfile }>('/api/public/auth/login', input);
}

export function logout() {
  return post<null>('/api/public/auth/logout');
}

export function getMe() {
  return get<UserProfile>('/api/public/auth/me');
}

export function completeProfile(input: CompleteProfileInput) {
  return post<UserProfile>('/api/public/auth/complete-profile', input);
}
