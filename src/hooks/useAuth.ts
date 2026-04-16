"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";

export function useAuth() {
  const { setUserId, setAuthReady, userId, isAuthReady } = useVaultStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      setAuthReady(true);
    });
    return unsubscribe;
  }, [setUserId, setAuthReady]);

  return { userId, isAuthReady, isLoggedIn: !!userId };
}
