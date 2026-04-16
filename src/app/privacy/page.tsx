import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LegalPageBackLink } from "@/components/vault/legal-page-back-link";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";

export const metadata = {
  title: "Privacy Policy  -  Vault.env",
  description: "How Vault.env handles your data with a zero-knowledge architecture.",
};

const SECTIONS = [
  {
    title: "1. Overview",
    body: `Vault.env is a zero-knowledge secret manager. This means your encryption key (derived from your Master Password) is generated entirely inside your browser and never transmitted to our servers. We are technically incapable of reading your secrets, files, or notes.`,
  },
  {
    title: "2. Data We Store",
    body: `We store the following data on Firebase (Google Cloud):

• Your email address and Firebase Authentication UID.
• Encrypted ciphertext of your secrets, files, and notes  -  each sealed with AES-256-GCM using a key we never see.
• Initialisation vectors (IV) and salts used for encryption  -  these are not secret and cannot decrypt your data without your Master Password.
• Project metadata: project names, chosen icons, and optional project logo URLs (stored in Firebase Storage).
• Timestamps (created/updated).

We do NOT store:
• Your Master Password  -  not even a hash.
• Any plaintext version of your secrets or notes.
• Browser fingerprints or tracking identifiers.`,
  },
  {
    title: "3. Your Master Password",
    body: `Your Master Password is used locally to derive an AES-256 encryption key via PBKDF2 (100 000 iterations, SHA-256). It exists only in your browser's memory for the duration of your session. When you lock the vault or close the tab, the key is discarded. We have no recovery mechanism  -  if you forget your Master Password, your encrypted data cannot be decrypted by anyone, including us.`,
  },
  {
    title: "4. Firebase & Google Cloud",
    body: `We use Google Firebase for authentication and storage. Google's data is processed in accordance with their Privacy Policy (policies.google.com/privacy). Firebase data may be stored on servers in the United States or the European Union depending on your region setting. We have no control over Google's internal infrastructure.`,
  },
  {
    title: "5. Project Logo Images",
    body: `If you upload a custom project logo, it is stored unencrypted in Firebase Storage with a publicly readable URL (required to display the image in your browser). Do not upload images that contain sensitive information.`,
  },
  {
    title: "6. Cookies & Local Storage",
    body: `We do not use advertising or tracking cookies. Firebase Authentication stores an auth token in IndexedDB / localStorage to keep you signed in across sessions. No third-party analytics or tracking scripts are loaded.`,
  },
  {
    title: "7. Data Retention & Deletion",
    body: `Your data is retained for as long as you have an account. You can delete individual projects, secrets, files, or notes at any time. To request full account deletion and erasure of all associated data, contact us at the address below. We will process deletion requests within 30 days.`,
  },
  {
    title: "8. Security",
    body: `All data in transit is protected by TLS. Data at rest is protected by Firebase's server-side encryption in addition to your own client-side AES-256-GCM encryption layer. However, no system is 100% secure. Do not use Vault.env as your sole backup of critical credentials.`,
  },
  {
    title: "9. Children",
    body: `Vault.env is not directed at children under 13 (or under 16 in the EEA). We do not knowingly collect personal information from children.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new policy.`,
  },
  {
    title: "11. Contact",
    body: `For privacy-related questions or deletion requests, please open an issue on the project repository or contact the maintainer directly.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>

      {/* ── Minimal nav ── */}
      <header style={{
        borderBottom: "2px solid #000",
        backgroundColor: "#1A1A1A",
        padding: "0 28px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none", color: "#fff",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: "#C1F0C1", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "2px 2px 0 0 #fff",
          }}>
            <ShieldCheck size={18} color="#1A1A1A" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em" }}>
            Vault.env
          </span>
        </Link>
        <LegalPageBackLink />
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "60px 28px 80px", boxSizing: "border-box" }}>

        {/* Header badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: "inline-block",
            padding: "6px 14px", borderRadius: 999,
            border: "2px solid #000", backgroundColor: "#C1F0C1",
            fontSize: 12, fontWeight: 800, letterSpacing: "0.06em",
            boxShadow: "3px 3px 0 0 #000",
          }}>
            LEGAL
          </span>
        </div>

        <h1 style={{
          margin: "0 0 12px", fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1,
        }}>
          Privacy Policy
        </h1>
        <p style={{ margin: "0 0 48px", fontSize: 15, color: "#6b7280" }}>
          Last updated: April 15, 2026
        </p>

        {/* Lead */}
        <div style={{
          padding: "22px 28px", marginBottom: 48,
          border: "2px solid #000", borderRadius: 20,
          backgroundColor: "#fff", boxShadow: "5px 5px 0 0 #000",
        }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, fontWeight: 600 }}>
            <strong>TL;DR</strong>  -  We cannot read your secrets. Your encryption key is derived
            from your Master Password inside your browser and never sent to us. We store only
            encrypted ciphertext. Losing your Master Password means permanent loss of access  - 
            there is no recovery.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 style={{
                margin: "0 0 12px", fontSize: 18, fontWeight: 900,
                letterSpacing: "-0.03em",
              }}>
                {section.title}
              </h2>
              <p style={{
                margin: 0, fontSize: 15, lineHeight: 1.8,
                color: "#374151", whiteSpace: "pre-line",
              }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

      </main>

      <BlogStaticFooter />

    </div>
  );
}
