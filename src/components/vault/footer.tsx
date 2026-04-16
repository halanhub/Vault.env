"use client";

import Link from "next/link";
import { useMobile } from "@/hooks/useMobile";

export function Footer() {
  const isMobile = useMobile();

  return (
    <footer style={{
      borderTop: "2px solid #e5e7eb",
      padding: isMobile ? "20px 16px" : "18px 28px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: isMobile ? 12 : 10,
      backgroundColor: "#FDFCF0",
    }}>
      <span style={{ fontSize: 12, color: "#9ca3af" }}>
        © {new Date().getFullYear()} Vault.env - Zero-Knowledge Secret Manager
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "10px 16px" : 20 }}>
        <FooterLink href="/blog">Blog</FooterLink>
        <FooterLink href="/contact">Contact</FooterLink>
        <FooterLink href="/privacy">Privacy Policy</FooterLink>
        <FooterLink href="/terms">Terms of Service</FooterLink>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1A1A")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
    >
      {children}
    </Link>
  );
}
