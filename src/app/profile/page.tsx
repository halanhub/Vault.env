"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from "firebase/auth";
import { ArrowLeft, CreditCard, KeyRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";
import { getBillingStatus, type BillingStatus } from "@/lib/billing";
import { Header } from "@/components/vault/header";
import { Footer } from "@/components/vault/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { buildCustomerPortalLoginHref } from "@/lib/customer-portal-url";
import { buildSubscribeCheckoutHref } from "@/lib/subscribe-url";
import { useMobile } from "@/hooks/useMobile";

const CHECKOUT_BASE = process.env.NEXT_PUBLIC_CHECKOUT_URL;

const portalCtaButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  width: "100%",
  touchAction: "manipulation",
  userSelect: "none",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 999,
  fontWeight: 700,
  height: 48,
  padding: "0 22px",
  fontSize: 15,
  letterSpacing: "-0.02em",
  backgroundColor: "#1A1A1A",
  color: "#fff",
  border: "2px solid #000",
  boxShadow: "4px 4px 0 0 #000",
  textDecoration: "none",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  border: "2px solid #000",
  backgroundColor: "#fff",
  boxShadow: "4px 4px 0 0 #000",
  padding: "24px 22px",
  boxSizing: "border-box",
};

export default function ProfilePage() {
  const userId = useVaultStore((s) => s.userId);
  const subscribeHref = buildSubscribeCheckoutHref(CHECKOUT_BASE, userId);
  const customerPortalHref = buildCustomerPortalLoginHref();
  const isMobile = useMobile();
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<BillingStatus>({ soloActive: false });
  const [billingLoading, setBillingLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const loadBilling = useCallback(async () => {
    if (!userId) return;
    setBillingLoading(true);
    try {
      const b = await getBillingStatus(userId);
      setBilling(b);
    } catch (e) {
      console.error(e);
    } finally {
      setBillingLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const hasPasswordProvider =
    user?.providerData?.some((p) => p.providerId === "password") ?? false;

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!user || !hasPasswordProvider) return;
    if (!currentPassword || !newPassword) {
      setPwError("Fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email ?? "", currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setPwSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPwError("Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        setPwError("Too many attempts. Try again later.");
      } else {
        const msg = err instanceof Error ? err.message : "Could not update password.";
        setPwError(msg);
      }
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#FDFCF0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          maxWidth: 560,
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "20px 16px 48px" : "40px 28px 64px",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            padding: "10px 22px",
            borderRadius: 999,
            border: "2px solid #000",
            backgroundColor: "#fff",
            color: "#1A1A1A",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textDecoration: "none",
            boxShadow: "4px 4px 0 0 #000",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(1px, 1px)";
            e.currentTarget.style.boxShadow = "3px 3px 0 0 #000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "4px 4px 0 0 #000";
          }}
        >
          <ArrowLeft size={18} strokeWidth={3} aria-hidden />
          Back to Projects
        </Link>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          Profile
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 15, color: "#6b7280", fontWeight: 600 }}>
          Account security and Solo subscription.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section style={cardStyle}>
            <h2
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              Account
            </h2>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#4b5563" }}>
              Signed in as{" "}
              <strong style={{ color: "#1A1A1A" }}>{user?.email ?? "…"}</strong>
            </p>
          </section>

          <section style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <KeyRound size={20} strokeWidth={2.5} color="#1A1A1A" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Password
              </h2>
            </div>

            {!hasPasswordProvider ? (
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                You signed in with Google. Password changes apply to email/password accounts only. To use a
                password, add one in your Google account settings or link an email/password sign-in method in
                Firebase if you enable it.
              </p>
            ) : (
              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input
                  type="password"
                  label="Current password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  label="New password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {pwError ? (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{pwError}</p>
                ) : null}
                {pwSuccess ? (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#3a9a3a" }}>{pwSuccess}</p>
                ) : null}
                <Button type="submit" size="md" disabled={pwLoading} style={{ alignSelf: "flex-start" }}>
                  {pwLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : "Update password"}
                </Button>
              </form>
            )}
          </section>

          <section style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <CreditCard size={20} strokeWidth={2.5} color="#1A1A1A" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Subscription
              </h2>
            </div>

            {billingLoading ? (
              <div style={{ padding: "8px 0" }}>
                <Spinner size="md" />
              </div>
            ) : billing.soloActive ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151", lineHeight: 1.5 }}>
                  <strong style={{ color: "#1A1A1A" }}>Solo</strong> is active on your account. You can create
                  multiple encrypted projects.
                </p>
                {customerPortalHref ? (
                  <>
                    <a
                      href={customerPortalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm:w-auto"
                      style={portalCtaButtonStyle}
                    >
                      <CreditCard size={16} strokeWidth={2.5} aria-hidden />
                      Manage subscription
                    </a>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                      Opens Dodo&apos;s secure customer portal in a new tab. Sign in with the{" "}
                      <strong style={{ color: "#374151" }}>same email</strong> as this Vault.env account. There you
                      can <strong style={{ color: "#374151" }}>cancel</strong> (immediately or at period end), update
                      payment, or download invoices.
                    </p>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#9ca3af", lineHeight: 1.55 }}>
                    To show a &quot;Manage subscription&quot; button here, set{" "}
                    <code style={{ fontSize: 12, color: "#6b7280" }}>NEXT_PUBLIC_DODO_CUSTOMER_PORTAL_LOGIN_URL</code>{" "}
                    (full static portal link from Dodo: Sales → Customer → Share invite) or{" "}
                    <code style={{ fontSize: 12, color: "#6b7280" }}>NEXT_PUBLIC_DODO_BUSINESS_ID</code> for the hosted
                    login URL. Until then, use the same email as this account at your Dodo customer portal to cancel.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#374151", lineHeight: 1.55 }}>
                  You&apos;re on the <strong style={{ color: "#1A1A1A" }}>free tier</strong> (one project).
                  Subscribe to <strong style={{ color: "#1A1A1A" }}>Solo</strong> ($5/month) for unlimited
                  vaults.
                </p>
                {subscribeHref ? (
                  <a
                    href={subscribeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full touch-manipulation select-none items-center justify-center gap-2 rounded-full font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:w-auto"
                    style={{
                      height: 48,
                      padding: "0 22px",
                      fontSize: 15,
                      letterSpacing: "-0.02em",
                      backgroundColor: "#1A1A1A",
                      color: "#fff",
                      border: "2px solid #000",
                      boxShadow: "4px 4px 0 0 #000",
                      textDecoration: "none",
                    }}
                  >
                    <CreditCard size={16} strokeWidth={2.5} />
                    Open checkout
                  </a>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#9ca3af", lineHeight: 1.5 }}>
                    When your admin sets <code style={{ fontSize: 12 }}>NEXT_PUBLIC_CHECKOUT_URL</code>, a
                    payment link appears here and in the header.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
