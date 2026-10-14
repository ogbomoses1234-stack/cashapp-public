import { create } from 'zustand';
import { clearAllStoredTokens } from '@/utils/authStorage';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  hydrated: boolean;
  setUser: (u: UserProfile | null) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clear: () => {
    clearAllStoredTokens();
    set({ user: null });
  },
}));