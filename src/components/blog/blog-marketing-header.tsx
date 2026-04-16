import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LegalPageBackLink } from "@/components/vault/legal-page-back-link";

export function BlogMarketingHeader({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
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
      <LegalPageBackLink href={backHref} label={backLabel} />
    </header>
  );
}
