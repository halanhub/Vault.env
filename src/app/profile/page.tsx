"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  type User,
} from "firebase/auth";
import { ArrowLeft, CreditCard, KeyRound } from "lucide-react";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";
import { getBillingStatus, type BillingStatus } from "@/lib/billing";
import { Header } from "@/components/vault/header";
import { Footer } from "@/components/vault/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { buildSubscribeCheckoutHref } from "@/lib/subscribe-url";
import { Modal } from "@/components/ui/modal";
import { useMobile } from "@/hooks/useMobile";

const CHECKOUT_BASE = process.env.NEXT_PUBLIC_CHECKOUT_URL;

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

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelWhen, setCancelWhen] = useState<"period_end" | "immediate">("period_end");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

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
    if (!user) return;
    if (hasPasswordProvider && !currentPassword) {
      setPwError("Enter your current password.");
      return;
    }
    if (!newPassword) {
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
      const email = user.email ?? "";
      if (!email) {
        setPwError("This account does not have an email address.");
        return;
      }
      const newCred = EmailAuthProvider.credential(email, newPassword);
      if (hasPasswordProvider) {
        const currentCred = EmailAuthProvider.credential(email, currentPassword);
        await reauthenticateWithCredential(user, currentCred);
        await updatePassword(user, newPassword);
        setPwSuccess("Password updated.");
      } else {
        try {
          await linkWithCredential(user, newCred);
        } catch (err: unknown) {
          const code =
            err && typeof err === "object" && "code" in err
              ? String((err as { code: string }).code)
              : "";
          if (code !== "auth/requires-recent-login") throw err;
          await reauthenticateWithPopup(user, googleAuthProvider);
          await linkWithCredential(user, newCred);
        }
        await user.reload();
        setUser(auth.currentUser);
        setPwSuccess("CLI password added. You can now run vault-env login with this email and password.");
      }
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

  async function submitCancelSubscription() {
    setCancelError("");
    setCancelSuccess("");
    const u = auth.currentUser;
    if (!u) {
      setCancelError("Not signed in.");
      return;
    }
    setCancelLoading(true);
    try {
      const idToken = await u.getIdToken();
      const res = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ when: cancelWhen }),
      });
      const raw = await res.text();
      let data = {} as { error?: string };
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          setCancelError(
            res.status ? `Could not cancel (${res.status}). Try again or check Netlify function logs.` : "Invalid response from server."
          );
          return;
        }
      } else if (!res.ok) {
        setCancelError(`Could not cancel (${res.status}).`);
        return;
      }
      if (!res.ok) {
        setCancelError(data.error ?? "Could not cancel subscription.");
        return;
      }
      setCancelSuccess(
        cancelWhen === "period_end"
          ? "Cancellation scheduled: you keep Solo until this billing period ends. Your billing page may still show Solo as active until then—that is expected."
          : "Subscription cancelled. If your account page still shows Solo, refresh in a moment."
      );
      setCancelModalOpen(false);
      await loadBilling();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setCancelLoading(false);
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
              <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                You signed in with Google. Add a Vault.env password here to use the CLI with the same email,
                user ID, and projects.
              </p>
            ) : null}

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {hasPasswordProvider ? (
                <Input
                  type="password"
                  label="Current password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              ) : null}
                <Input
                  type="password"
                  label={hasPasswordProvider ? "New password" : "CLI password"}
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
                  {pwLoading ? (
                    <Spinner size="sm" className="border-white border-t-transparent" />
                  ) : hasPasswordProvider ? (
                    "Update password"
                  ) : (
                    "Add CLI password"
                  )}
                </Button>
              </form>
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
                {cancelSuccess ? (
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#3a9a3a", lineHeight: 1.55 }}>
                    {cancelSuccess}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  style={{ alignSelf: "flex-start" }}
                  onClick={() => {
                    setCancelError("");
                    setCancelSuccess("");
                    setCancelModalOpen(true);
                  }}
                >
                  Cancel Solo subscription
                </Button>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                  Choose when Solo ends using the button above. Receipts and payment-method updates use the same email
                  as this account—check your billing messages for links.
                </p>
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

      <Modal
        open={cancelModalOpen}
        onClose={() => {
          if (!cancelLoading) setCancelModalOpen(false);
        }}
        title="Cancel Solo subscription"
        maxWidth={480}
      >
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#4b5563", lineHeight: 1.55 }}>
          Choose when your Solo access should end. No separate login to Dodo is required.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <input
              type="radio"
              name="cancel-when"
              checked={cancelWhen === "period_end"}
              onChange={() => setCancelWhen("period_end")}
              disabled={cancelLoading}
              style={{ marginTop: 3 }}
            />
            <span>
              At end of current billing period
              <span
                style={{ display: "block", fontWeight: 600, color: "#6b7280", fontSize: 13 }}
              >
                Keeps Solo until the period you already paid for ends.
              </span>
            </span>
          </label>
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <input
              type="radio"
              name="cancel-when"
              checked={cancelWhen === "immediate"}
              onChange={() => setCancelWhen("immediate")}
              disabled={cancelLoading}
              style={{ marginTop: 3 }}
            />
            <span>
              Immediately
              <span
                style={{ display: "block", fontWeight: 600, color: "#6b7280", fontSize: 13 }}
              >
                Stops the subscription now; Solo may end right away.
              </span>
            </span>
          </label>
        </div>
        {cancelError ? (
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{cancelError}</p>
        ) : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={cancelLoading}
            onClick={() => setCancelModalOpen(false)}
          >
            Keep Solo
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={cancelLoading}
            onClick={() => void submitCancelSubscription()}
          >
            {cancelLoading ? (
              <Spinner size="sm" className="border-white border-t-transparent" />
            ) : (
              "Confirm cancel"
            )}
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
