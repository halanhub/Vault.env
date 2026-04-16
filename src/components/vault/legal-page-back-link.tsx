"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Chunky pill control for legal / static pages  -  matches mint badge + shadow UI on dark header. */
export function LegalPageBackLink({
  href = "/",
  label = "Back",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        border: "2px solid #000",
        backgroundColor: "#C1F0C1",
        color: "#1A1A1A",
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        textDecoration: "none",
        boxShadow: "4px 4px 0 0 #fff",
        flexShrink: 0,
        transition: "transform 0.1s, box-shadow 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(1px, 1px)";
        e.currentTarget.style.boxShadow = "3px 3px 0 0 #fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "4px 4px 0 0 #fff";
      }}
    >
      <ArrowLeft size={16} strokeWidth={2.5} aria-hidden />
      {label}
    </Link>
  );
}
