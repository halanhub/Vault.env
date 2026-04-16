"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "@/store/vault-store";

const AppShell = dynamic(
  () => import("@/components/vault/app-shell").then((m) => m.AppShell),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const isUnlocked = useVaultStore((s) => s.isUnlocked);

  useEffect(() => {
    if (isUnlocked) {
      router.replace("/dashboard");
    }
  }, [isUnlocked, router]);

  return (
    <AppShell>
      <div />
    </AppShell>
  );
}
