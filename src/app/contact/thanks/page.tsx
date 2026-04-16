import Link from "next/link";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { LegalPageBackLink } from "@/components/vault/legal-page-back-link";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";

export const metadata = {
  title: "Message sent  -  Vault.env",
  description: "Your contact form was submitted.",
};

export default function ContactThanksPage() {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "2px solid #000",
          backgroundColor: "#1A1A1A",
          padding: "0 28px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "#C1F0C1",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "2px 2px 0 0 #fff",
            }}
          >
            <ShieldCheck size={18} color="#1A1A1A" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em" }}>Vault.env</span>
        </Link>
        <LegalPageBackLink label="Home" />
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 560,
          width: "100%",
          margin: "0 auto",
          padding: "56px 28px 80px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 24px",
            borderRadius: "50%",
            border: "2px solid #000",
            backgroundColor: "#C1F0C1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "4px 4px 0 0 #000",
          }}
        >
          <CheckCircle2 size={32} color="#1A1A1A" strokeWidth={2.25} aria-hidden />
        </div>
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
          }}
        >
          Thanks  -  your message was sent
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>
          We&apos;ll get back to you by email when we can. If you don&apos;t hear back, check spam or try again from
          the contact page.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 999,
            border: "2px solid #000",
            backgroundColor: "#fff",
            color: "#1A1A1A",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "3px 3px 0 0 #000",
          }}
        >
          Back to home
        </Link>
      </main>

      <BlogStaticFooter />
    </div>
  );
}
