"use client";

import { useEffect, useRef, useCallback } from "react";
import { useVaultStore } from "@/store/vault-store";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export function useIdle() {
  const lock = useVaultStore((s) => s.lock);
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isUnlocked) {
      timerRef.current = setTimeout(() => {
        lock();
      }, IDLE_TIMEOUT);
    }
  }, [isUnlocked, lock]);

  useEffect(() => {
    if (!isUnlocked) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isUnlocked, resetTimer]);
}
