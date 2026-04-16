import Link from "next/link";
import type { CSSProperties } from "react";

/** Shared footer for marketing / blog static pages (matches contact/privacy link set). */
export function BlogStaticFooter() {
  const linkStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: "#1A1A1A",
    textDecoration: "none",
  };
  return (
    <footer
      style={{
        borderTop: "2px solid #000",
        padding: "24px 28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        backgroundColor: "#fff",
      }}
    >
      <span style={{ fontSize: 13, color: "#6b7280" }}>© {new Date().getFullYear()} Vault.env</span>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Link href="/blog" style={linkStyle}>
          Blog
        </Link>
        <Link href="/contact" style={linkStyle}>
          Contact
        </Link>
        <Link href="/privacy" style={linkStyle}>
          Privacy Policy
        </Link>
        <Link href="/terms" style={linkStyle}>
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
