import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LegalPageBackLink } from "@/components/vault/legal-page-back-link";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";

export const metadata = {
  title: "Terms of Service  -  Vault.env",
  description: "Terms and conditions for using Vault.env.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using Vault.env ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We reserve the right to update these terms at any time; continued use constitutes acceptance of any revisions.`,
  },
  {
    title: "2. Description of Service",
    body: `Vault.env is a zero-knowledge secret management tool that allows users to store encrypted environment variables, files, and notes. All encryption is performed client-side in the user's browser. The Service is provided on an "as-is" and "as-available" basis.`,
  },
  {
    title: "3. User Accounts & Master Password",
    body: `You are responsible for:

• Maintaining the confidentiality of your account credentials (email and password).
• Keeping your Master Password safe and memorable. We have no ability to recover it  -  losing your Master Password results in permanent, irrecoverable loss of all encrypted data.
• All activity that occurs under your account.

You must notify us immediately of any unauthorised use of your account.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree not to use the Service to:

• Store, transmit, or distribute content that is illegal, harmful, or violates any applicable law.
• Attempt to circumvent, reverse-engineer, or attack the Service's security measures.
• Use the Service in a manner that could damage, disable, or impair the Service.
• Attempt to gain unauthorised access to another user's account or data.
• Use automated means (bots, scrapers) to access the Service beyond normal use.`,
  },
  {
    title: "5. Data & Privacy",
    body: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please read it carefully. By using the Service, you consent to the data practices described in the Privacy Policy.`,
  },
  {
    title: "6. Intellectual Property",
    body: `The Vault.env software, design, trademarks, and all related materials are the property of the developer(s). You are granted a limited, non-exclusive, non-transferable licence to use the Service for your personal or internal business purposes. You may not copy, modify, distribute, sell, or lease any part of the Service.`,
  },
  {
    title: "7. Disclaimer of Warranties",
    body: `THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

WE DO NOT WARRANT THAT:
• The Service will be uninterrupted, error-free, or completely secure.
• Any data stored through the Service will not be lost or corrupted.
• The Service will meet your specific requirements.

You use the Service at your own risk. We strongly recommend maintaining offline backups of critical credentials.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `TO THE FULLEST EXTENT PERMITTED BY LAW, THE DEVELOPERS OF VAULT.ENV SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO USE THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM (OR $10 IF THE SERVICE IS FREE).`,
  },
  {
    title: "9. Indemnification",
    body: `You agree to indemnify, defend, and hold harmless Vault.env and its developers from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or in connection with your violation of these Terms or your use of the Service.`,
  },
  {
    title: "10. Termination",
    body: `We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive.`,
  },
  {
    title: "11. Third-Party Services",
    body: `The Service relies on Google Firebase for authentication and data storage. Your use of those services is also subject to Google's Terms of Service. We are not responsible for the availability or conduct of any third-party services.`,
  },
  {
    title: "12. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising from these Terms shall be resolved through good-faith negotiation before pursuing formal legal action.`,
  },
  {
    title: "13. Contact",
    body: `If you have questions about these Terms, please open an issue on the project repository or contact the maintainer directly.`,
  },
];

export default function TermsPage() {
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
          Terms of Service
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
            <strong>TL;DR</strong>  -  Use the Service lawfully and responsibly. We provide it
            as-is with no guarantees. Guard your Master Password carefully  -  we cannot recover it
            for you. Maintain your own backups of critical credentials.
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
