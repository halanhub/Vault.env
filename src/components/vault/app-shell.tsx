"use client";

import { useAuth } from "@/hooks/useAuth";
import { useIdle } from "@/hooks/useIdle";
import { useVaultStore } from "@/store/vault-store";
import { AuthForm } from "@/components/auth/auth-form";
import { LockScreen } from "@/components/vault/lock-screen";
import { Spinner } from "@/components/ui/spinner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAuthReady } = useAuth();
  const isUnlocked = useVaultStore((s) => s.isUnlocked);

  useIdle();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthForm />;
  }

  if (!isUnlocked) {
    return <LockScreen />;
  }

  return <>{children}</>;
}
