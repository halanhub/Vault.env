"use client";

import Link from "next/link";
import { ShieldCheck, Lock, LogOut, CreditCard, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL;

export function Header() {
  const lock = useVaultStore((s) => s.lock);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      backgroundColor: "rgba(253,252,240,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "2px solid #000",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 10, border: "2px solid #000",
            backgroundColor: "#C1F0C1", boxShadow: "3px 3px 0 0 #000",
          }}>
            <ShieldCheck color="#1A1A1A" size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em" }}>
            Vault.env
          </span>
        </div>

        {/* Actions  -  Subscribe opens checkout after login (Option A: account first, then pay) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link
            href="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 16px",
              borderRadius: 999,
              border: "2px solid transparent",
              background: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "#1A1A1A",
              textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.borderColor = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <User size={15} strokeWidth={2.5} />
            Profile
          </Link>
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Solo plan  -  opens checkout in a new tab"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: 999,
                border: "2px solid #000",
                backgroundColor: "#1A1A1A",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "3px 3px 0 0 #000",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(1px, 1px)";
                e.currentTarget.style.boxShadow = "2px 2px 0 0 #000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "3px 3px 0 0 #000";
              }}
            >
              <CreditCard size={15} strokeWidth={2.5} />
              Subscribe
            </a>
          ) : null}
          <HeaderButton
            icon={<Lock size={15} strokeWidth={3} />}
            label="Lock"
            onClick={lock}
          />
          <HeaderButton
            icon={<LogOut size={15} strokeWidth={3} />}
            label="Sign Out"
            onClick={() => { lock(); signOut(auth); }}
            danger
          />
        </div>
      </div>
    </header>
  );
}

function HeaderButton({
  icon, label, onClick, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "7px 16px",
        borderRadius: 999,
        border: "2px solid transparent",
        background: "none",
        fontSize: 13, fontWeight: 700,
        color: danger ? "#ef4444" : "#1A1A1A",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#fff";
        e.currentTarget.style.borderColor = danger ? "#fca5a5" : "#000";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
