import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  hydrated: boolean;         // have we tried to fetch /me yet?
  setUser: (u: UserProfile | null) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clear: () => set({ user: null }),
}));
