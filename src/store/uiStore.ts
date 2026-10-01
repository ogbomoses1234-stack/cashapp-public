import { create } from 'zustand';

interface UIState {
  authModalOpen: boolean;
  authModalMessage: string | null;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  authModalOpen: false,
  authModalMessage: null,
  openAuthModal: (authModalMessage) => set({ authModalOpen: true, authModalMessage: authModalMessage ?? null }),
  closeAuthModal: () => set({ authModalOpen: false, authModalMessage: null }),
}));
