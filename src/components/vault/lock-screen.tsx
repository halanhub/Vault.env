"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";
import { getVerificationPayload, setVerificationPayload } from "@/lib/firestore";
import { verifyMasterPassword, createVerificationPayload } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function LockScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewVault, setIsNewVault] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  const userId = useVaultStore((s) => s.userId);
  const setMasterPassword = useVaultStore((s) => s.setMasterPassword);

  // ── Run once after mount, never in the render body ──
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function checkVaultStatus() {
      setLoading(true);
      try {
        const payload = await getVerificationPayload(userId!);
        if (!cancelled) setIsNewVault(payload === null);
      } catch {
        if (!cancelled) setIsNewVault(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setChecked(true);
        }
      }
    }

    checkVaultStatus();
    return () => { cancelled = true; };
  }, [userId]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) { setError("Enter your master password."); return; }
    if (isNewVault && password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (isNewVault && password.length < 8) { setError("Master password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      if (isNewVault) {
        const payload = await createVerificationPayload(password);
        await setVerificationPayload(userId!, payload);
        setMasterPassword(password);
      } else {
        const payload = await getVerificationPayload(userId!);
        if (!payload) { setError("Verification data missing."); return; }
        const valid = await verifyMasterPassword(password, payload);
        if (!valid) { setError("Incorrect master password."); return; }
        setMasterPassword(password);
      }
    } catch (err: unknown) {
      console.error("[LockScreen] vault error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
        setError("Firestore permission denied. Check your security rules in the Firebase Console.");
      } else if (msg.includes("unavailable") || msg.includes("offline")) {
        setError("Cannot reach Firebase. Check your internet connection.");
      } else {
        setError(msg || "Failed to unlock vault. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const title   = !checked ? "Checking vault…" : isNewVault ? "Set Up Your Vault"   : "Vault Locked";
  const subtitle = !checked ? "Verifying encryption status…" : isNewVault
    ? "Choose a master password to encrypt all your secrets."
    : "Enter your master password to decrypt your secrets.";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#FDFCF0",
      overflowY: "auto", padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 440, margin: "auto" }}>

        {/* Icon + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 72, height: 72,
            borderRadius: 24, border: "2px solid #000",
            backgroundColor: "#C1F0C1", boxShadow: "5px 5px 0 0 #000",
            marginBottom: 20,
          }}>
            <Lock color="#1A1A1A" size={32} strokeWidth={2.5} />
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em" }}>
            {title}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "#6b7280" }}>{subtitle}</p>
        </div>

        {/* Loading state */}
        {!checked ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <Spinner size="lg" />
          </div>
        ) : (
          /* Unlock card */
          <div style={{
            backgroundColor: "#fff",
            border: "2px solid #000",
            borderRadius: 32,
            padding: "36px 36px 28px",
            boxShadow: "6px 6px 0 0 #000",
            boxSizing: "border-box",
          }}>
            <form
              onSubmit={handleUnlock}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <Input
                id="masterPassword"
                label="Master Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />

              {isNewVault && (
                <Input
                  id="confirmMasterPassword"
                  label="Confirm Master Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              )}

              {error && (
                <p style={{
                  margin: 0, padding: "10px 16px",
                  borderRadius: 12, border: "1px solid #fca5a5",
                  backgroundColor: "#fef2f2",
                  fontSize: 14, fontWeight: 600, color: "#dc2626",
                }}>
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full"
                style={{ height: 54 }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" className="border-white border-t-transparent" />
                ) : (
                  <>
                    {isNewVault ? "Create Vault" : "Unlock"}
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div style={{
              marginTop: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
                <ShieldCheck size={14} />
                <span>AES-256-GCM · PBKDF2</span>
              </div>
              <button
                type="button"
                onClick={() => signOut(auth)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, color: "#9ca3af",
                  padding: "4px 0",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
