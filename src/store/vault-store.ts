import { create } from "zustand";

interface VaultState {
  masterPassword: string | null;
  isUnlocked: boolean;
  isAuthReady: boolean;
  userId: string | null;

  setMasterPassword: (password: string) => void;
  lock: () => void;
  setUserId: (uid: string | null) => void;
  setAuthReady: (ready: boolean) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  masterPassword: null,
  isUnlocked: false,
  isAuthReady: false,
  userId: null,

  setMasterPassword: (password: string) =>
    set({ masterPassword: password, isUnlocked: true }),

  lock: () => set({ masterPassword: null, isUnlocked: false }),

  setUserId: (uid: string | null) => set({ userId: uid }),

  setAuthReady: (ready: boolean) => set({ isAuthReady: ready }),
}));
