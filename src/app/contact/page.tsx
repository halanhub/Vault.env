import Link from "next/link";
import { ShieldCheck, Mail } from "lucide-react";
import { LegalPageBackLink } from "@/components/vault/legal-page-back-link";
import { ContactNetlifyForm } from "@/components/contact/contact-netlify-form";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";

export const metadata = {
  title: "Contact  -  Vault.env",
  description: "Send a message to the Vault.env team.",
};

export default function ContactPage() {
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
        <LegalPageBackLink />
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 560,
          width: "100%",
          margin: "0 auto",
          padding: "48px 28px 80px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              border: "2px solid #000",
              backgroundColor: "#C1F0C1",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              boxShadow: "3px 3px 0 0 #000",
            }}
          >
            <Mail size={14} strokeWidth={2.5} aria-hidden />
            CONTACT
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Get in touch
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 15, color: "#6b7280", lineHeight: 1.5 }}>
          Questions, feedback, or privacy requests - send a message below.
        </p>

        <div
          style={{
            padding: "28px 28px 32px",
            border: "2px solid #000",
            borderRadius: 24,
            backgroundColor: "#fff",
            boxShadow: "6px 6px 0 0 #000",
          }}
        >
          {/*
            Netlify Forms: enable “Form detection” under Site settings → Forms.
            Fields match public/netlify-form-contact.html; submission uses fetch POST to / (see ContactNetlifyForm).
          */}
          <ContactNetlifyForm />
        </div>
      </main>

      <BlogStaticFooter />
    </div>
  );
}
