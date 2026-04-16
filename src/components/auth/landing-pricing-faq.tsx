"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Check, Gift, User, Users } from "lucide-react";
import { FREE_PROJECT_LIMIT } from "@/lib/billing";

const ICON_PLAN = 26;
const ICON_STROKE = 2.5;

const HAS_CHECKOUT_URL = Boolean(process.env.NEXT_PUBLIC_CHECKOUT_URL);

const FREE_FEATURES = [
  `${FREE_PROJECT_LIMIT} encrypted project (vault)`,
  "Client-side AES-256-GCM encryption",
  "CLI pull & push to local .env",
  "Master password vault lock",
];

const SOLO_FEATURES = [
  "Unlimited projects",
  "Client-side AES-256-GCM encryption",
  "CLI pull & push to local .env",
  "Master password vault lock",
];

const TEAM_FEATURES = [
  "Everything in Solo",
  "Shared projects & invites",
  "Seat-based billing",
  "Org-friendly workflows",
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What does zero-knowledge mean?",
    a: "Your encryption key is derived from your master password only inside your browser. We never receive your master password or your raw secrets - only ciphertext stored on Firebase.",
  },
  {
    q: "Can Vault.env read my secrets?",
    a: "No. Secret values, file contents, and notes are encrypted before they leave your device. We cannot decrypt them without your master password.",
  },
  {
    q: "What if I forget my master password?",
    a: "There is no recovery path. Encrypted data cannot be decrypted without the correct master password - not even by us. Keep it safe.",
  },
  {
    q: "Does this replace my host’s env UI (Vercel, Railway, etc.)?",
    a: "Vault.env is for storing and syncing secrets to your machine (e.g. a .env file). You still set deployment env vars on each platform, or use their APIs - often after pulling from Vault.env locally or in CI.",
  },
  {
    q: "How does billing work?",
    a: "You can use Vault.env free with one encrypted project. To create additional projects, subscribe to Solo ($5/month) from the header after you sign in. Team will be available separately when collaboration ships.",
  },
];

/**
 * Flex: feature list grows; CTA bundle uses marginTop:auto at the bottom of the card.
 * Footnote slot uses a fixed height so longer Solo copy does not shift buttons vs other columns.
 */
const cardStyle: CSSProperties = {
  backgroundColor: "#fff",
  border: "2px solid #000",
  borderRadius: 40,
  padding: "40px 36px 20px",
  boxShadow: "6px 6px 0 0 #000",
  boxSizing: "border-box",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const ctaBundleStyle: CSSProperties = {
  marginTop: "auto",
  width: "100%",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  /** Space between “what’s included” (feature list) and the primary button */
  paddingTop: 36,
};

const planRowTop: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  height: 56,
  boxSizing: "border-box",
  overflow: "hidden",
};

const planDescStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#6b7280",
  fontWeight: 600,
  lineHeight: 1.45,
  height: 52,
  boxSizing: "border-box",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const planPriceRowStyle: CSSProperties = {
  margin: 0,
  height: 60,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const listGrowStyle: CSSProperties = {
  margin: 0,
  padding: "12px 0 8px",
  listStyle: "none",
  flex: 1,
  minHeight: 0,
  overflow: "auto",
};

const btnRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: 52,
  boxSizing: "border-box",
};

const footnoteSlotStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#6b7280",
  textAlign: "center",
  lineHeight: 1.45,
  boxSizing: "border-box",
  padding: "0 4px",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  /** Tall enough for 4 lines at 13px/1.45 on prod fonts + checkout blurb */
  height: 100,
  minHeight: 100,
  maxHeight: 100,
  overflowY: "auto",
};

export function LandingPricingFaq() {
  return (
    <section
      id="pricing"
      style={{
        backgroundColor: "#FDFCF0",
        borderTop: "2px solid #000",
        padding: "56px 24px 72px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 8px" }}>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            textAlign: "center",
          }}
        >
          Choose your plan
        </h2>
        <p
          style={{
            margin: "0 0 40px",
            fontSize: 16,
            fontWeight: 600,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Start free with one project. Upgrade to Solo for unlimited vaults. Team is on the roadmap.
        </p>

        <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Free */}
          <div className="min-h-0 lg:min-h-[520px]" style={cardStyle}>
            <div style={planRowTop}>
              <Gift
                size={ICON_PLAN}
                strokeWidth={ICON_STROKE}
                color="#1A1A1A"
                aria-hidden
                style={{ flexShrink: 0 }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Free
              </h3>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "2px solid #000",
                  backgroundColor: "#C1F0C1",
                }}
              >
                {FREE_PROJECT_LIMIT} project
              </span>
            </div>
            <p style={planDescStyle}>
              Try Vault.env at no cost  -  full encryption, one vault.
            </p>
            <div style={planPriceRowStyle}>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em" }}>$0</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#6b7280" }}>forever</span>
            </div>
            <ul style={listGrowStyle}>
              {FREE_FEATURES.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#374151",
                    lineHeight: 1.45,
                  }}
                >
                  <Check size={20} strokeWidth={2.5} color="#3a9a3a" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>

            <div style={ctaBundleStyle}>
              <div style={btnRowStyle}>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  style={{ height: 52, fontSize: 16, width: "100%" }}
                  onClick={() => {
                    document.getElementById("vault-auth-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  Get started free
                </Button>
              </div>
              <div style={footnoteSlotStyle}>
                No credit card. Need more vaults? Upgrade to Solo anytime.
              </div>
            </div>
          </div>

          {/* Solo */}
          <div className="min-h-0 lg:min-h-[520px]" style={cardStyle}>
            <div style={planRowTop}>
              <User
                size={ICON_PLAN}
                strokeWidth={ICON_STROKE}
                color="#1A1A1A"
                aria-hidden
                style={{ flexShrink: 0 }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Solo
              </h3>
            </div>
            <p style={planDescStyle}>
              Unlimited projects for one developer.
            </p>
            <div style={planPriceRowStyle}>
              <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em" }}>$5</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#6b7280" }}>/month</span>
            </div>
            <ul style={listGrowStyle}>
              {SOLO_FEATURES.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#374151",
                    lineHeight: 1.45,
                  }}
                >
                  <Check size={20} strokeWidth={2.5} color="#3a9a3a" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>

            <div style={ctaBundleStyle}>
              <div style={btnRowStyle}>
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  style={{ height: 52, fontSize: 16, width: "100%" }}
                  onClick={() => {
                    document.getElementById("vault-auth-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  Create account first
                </Button>
              </div>
              <div style={footnoteSlotStyle}>
                {HAS_CHECKOUT_URL ? (
                  <>
                    Solo is $5/month. After you sign in, use <strong style={{ color: "#374151" }}>Subscribe</strong> in
                    the app header to open checkout (account first, then pay).
                  </>
                ) : (
                  <>
                    Solo is $5/month. Create your account above; when checkout is configured, you&apos;ll subscribe from
                    the app after sign-in.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Team  -  coming soon */}
          <div
            className="min-h-0 lg:min-h-[520px]"
            style={{
              ...cardStyle,
              opacity: 0.92,
              backgroundColor: "#fafaf8",
            }}
          >
            <div style={planRowTop}>
              <Users
                size={ICON_PLAN}
                strokeWidth={ICON_STROKE}
                color="#1A1A1A"
                aria-hidden
                style={{ flexShrink: 0 }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Team
              </h3>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "2px solid #000",
                  backgroundColor: "#e5e7eb",
                }}
              >
                Coming soon
              </span>
            </div>
            <p style={planDescStyle}>
              For squads who need shared vaults and seats.
            </p>
            <div style={planPriceRowStyle}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#6b7280" }}>Pricing TBD</span>
            </div>
            <ul style={listGrowStyle}>
              {TEAM_FEATURES.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#6b7280",
                    lineHeight: 1.45,
                  }}
                >
                  <Check size={20} strokeWidth={2.5} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <div style={ctaBundleStyle}>
              <div style={btnRowStyle}>
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full font-bold"
                  style={{
                    height: 52,
                    fontSize: 16,
                    letterSpacing: "-0.02em",
                    backgroundColor: "#e5e7eb",
                    color: "#9ca3af",
                    border: "2px solid #d1d5db",
                    cursor: "not-allowed",
                  }}
                >
                  Not available yet
                </button>
              </div>
              <div style={footnoteSlotStyle} aria-hidden />
            </div>
          </div>
        </div>

        <div className="vault-faq" style={{ marginTop: 88, paddingTop: 8 }}>
          <h3
            style={{
              margin: "0 0 24px",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#6b7280",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            FAQ
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                style={{
                  border: "2px solid #000",
                  borderRadius: 14,
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  boxShadow: "3px 3px 0 0 #000",
                }}
              >
                <summary
                  style={{
                    padding: "14px 16px",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    listStyle: "none",
                  }}
                >
                  {q}
                </summary>
                <p
                  style={{
                    margin: 0,
                    padding: "0 16px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#4b5563",
                    lineHeight: 1.55,
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: 12,
                  }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
