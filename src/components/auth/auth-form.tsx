"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { LandingPricingFaq } from "@/components/auth/landing-pricing-faq";
import { Footer } from "@/components/vault/footer";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required."); return; }
    if (!isLogin && password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError("");
      } else if (code === "auth/account-exists-with-different-credential") {
        setError("This email is already registered with email/password. Sign in with your password.");
      } else {
        const msg = err instanceof Error ? err.message : "Google sign-in failed.";
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  const TAGS = ["AES-256-GCM", "PBKDF2", "Zero Knowledge", "E2E Encrypted"];

  return (
    <div style={{ backgroundColor: "#FDFCF0" }}>
      {/*
       * Hero: split-screen (cream | mint), min one viewport  -  matches landing reference.
       * Page scrolls to pricing + FAQ below.
       */}
      <div
        className="flex flex-col lg:flex-row lg:items-stretch"
        style={{ minHeight: "100dvh" }}
      >

      {/* ── LEFT  -  cream branding panel ── */}
      {/*
       * IMPORTANT: className controls display (hidden / lg:flex).
       * Inline style handles only color  -  no token dependency.
       */}
      <div
        className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:overflow-y-auto"
        style={{ backgroundColor: "#FDFCF0", minHeight: "100dvh" }}
      >
        <div style={{ width: "100%", maxWidth: 500, padding: "0 56px" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 44 }}>
            <div style={{
              width: 56, height: 56, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 16, border: "2px solid #000",
              backgroundColor: "#C1F0C1", boxShadow: "5px 5px 0 0 #000",
            }}>
              <ShieldCheck color="#1A1A1A" size={28} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
              Vault.env
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(38px, 3.6vw, 58px)",
            fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.04em", marginBottom: 24,
          }}>
            Your secrets,<br />
            <span style={{ color: "#3a9a3a" }}>encrypted.</span><br />
            Your keys,<br />
            <span style={{ color: "#3a9a3a" }}>protected.</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#555", marginBottom: 36 }}>
            Zero-knowledge .env management. Client-side AES-256 encryption.
            Your master password never leaves your browser.
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TAGS.map((tag) => (
              <span key={tag} style={{
                whiteSpace: "nowrap",
                padding: "8px 18px",
                borderRadius: 999,
                border: "2px solid #000",
                backgroundColor: "#fff",
                fontSize: 13, fontWeight: 700,
                boxShadow: "3px 3px 0 0 #000",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT  -  mint auth panel ── */}
      {/*
       * flex-1 fills remaining width on desktop; full width on mobile.
       * items-center + justify-center centers the card in the panel.
       */}
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{
          backgroundColor: "#C1F0C1",
          padding: "40px 24px",
          minHeight: "100dvh",
        }}
      >
        {/* Mobile-only logo */}
        <div
          className="flex items-center gap-3 lg:hidden"
          style={{ marginBottom: 28 }}
        >
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 12, border: "2px solid #000",
            backgroundColor: "#C1F0C1", boxShadow: "3px 3px 0 0 #000",
          }}>
            <ShieldCheck color="#1A1A1A" size={20} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em" }}>
            Vault.env
          </span>
        </div>

        {/* Auth card  -  fixed 460px max, always full width within that */}
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div
            id="vault-auth-card"
            style={{
            backgroundColor: "#fff",
            border: "2px solid #000",
            borderRadius: 36,
            padding: "40px 40px 32px",
            boxShadow: "6px 6px 0 0 #000",
            boxSizing: "border-box",
          }}
          >
            <h2 style={{
              margin: "0 0 8px 0",
              fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em",
            }}>
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ margin: "0 0 24px 0", fontSize: 15, color: "#6b7280" }}>
              {isLogin
                ? "Enter your credentials to access your vault."
                : "Set up your account to start encrypting."}
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                width: "100%", height: 52, marginBottom: 22,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                borderRadius: 999, border: "2px solid #000",
                backgroundColor: "#fff", color: "#1A1A1A",
                fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em",
                cursor: googleLoading || loading ? "not-allowed" : "pointer",
                opacity: googleLoading || loading ? 0.65 : 1,
                boxShadow: "4px 4px 0 0 #000",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
            >
              {googleLoading ? (
                <Spinner size="sm" className="border-gray-200 border-t-black" />
              ) : (
                <>
                  <GoogleGlyph />
                  Continue with Google
                </>
              )}
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginBottom: 22,
            }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                or email
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && (
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
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
                style={{ height: 54, fontSize: 16 }}
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <Spinner size="sm" className="border-white border-t-transparent" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
              </Button>
            </form>

            <div style={{ marginTop: 22, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, fontWeight: 700, color: "#1A1A1A",
                  textDecoration: "underline", textUnderlineOffset: 4,
                  padding: "6px 0",
                }}
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>

      </div>

      <LandingPricingFaq />

      <Footer />
    </div>
  );
}

/** Official-style multicolor Google "G" (trademark Google LLC). */
function GoogleGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
