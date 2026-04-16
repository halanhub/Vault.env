"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(
  () => import("@/components/vault/app-shell").then((m) => m.AppShell),
  { ssr: false }
);

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
