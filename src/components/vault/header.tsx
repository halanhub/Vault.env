"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, LogOut, CreditCard, User, Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useVaultStore } from "@/store/vault-store";
import { buildSubscribeCheckoutHref } from "@/lib/subscribe-url";

const CHECKOUT_BASE = process.env.NEXT_PUBLIC_CHECKOUT_URL;

export function Header() {
  const lock = useVaultStore((s) => s.lock);
  const userId = useVaultStore((s) => s.userId);
  const subscribeHref = buildSubscribeCheckoutHref(CHECKOUT_BASE, userId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    lock();
    signOut(auth);
  }

  function handleLock() {
    setMenuOpen(false);
    lock();
  }

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
        position: "relative",
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

        {/* ── Hamburger (all breakpoints, same as former mobile menu) ── */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 42, height: 42, borderRadius: 10,
              border: "2px solid #000", backgroundColor: "#fff",
              boxShadow: "3px 3px 0 0 #000", cursor: "pointer",
            }}
          >
            {menuOpen
              ? <X size={20} strokeWidth={2.5} />
              : <Menu size={20} strokeWidth={2.5} />}
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 2px)", right: 0,
              width: "min(260px, calc(100vw - 48px))",
              backgroundColor: "#FDFCF0",
              border: "2px solid #000",
              borderRadius: 16,
              boxShadow: "6px 6px 0 0 #000",
              zIndex: 40,
              overflow: "hidden",
            }}>
              <MobileMenuItem
                icon={<User size={17} strokeWidth={2.5} />}
                label="Profile"
                href="/profile"
                onClick={() => setMenuOpen(false)}
              />
              {subscribeHref && (
                <MobileMenuItem
                  icon={<CreditCard size={17} strokeWidth={2.5} />}
                  label="Subscribe"
                  href={subscribeHref}
                  external
                  onClick={() => setMenuOpen(false)}
                  accent
                />
              )}
              <div style={{ height: 1, backgroundColor: "#e5e7eb", margin: "0 16px" }} />
              <MobileMenuButton
                icon={<Lock size={17} strokeWidth={2.5} />}
                label="Lock"
                onClick={handleLock}
              />
              <MobileMenuButton
                icon={<LogOut size={17} strokeWidth={2.5} />}
                label="Sign Out"
                onClick={handleSignOut}
                danger
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Menu link ── */
function MobileMenuItem({
  icon, label, href, onClick, external = false, accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: () => void;
  external?: boolean;
  accent?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 20px",
    fontSize: 15, fontWeight: 700,
    color: accent ? "#1A1A1A" : "#1A1A1A",
    textDecoration: "none",
    backgroundColor: "transparent",
    transition: "background 0.1s",
  };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf0")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        onClick={onClick}
      >
        {icon}{label}
      </a>
    );
  }
  return (
    <Link href={href} style={style}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f0")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      onClick={onClick}
    >
      {icon}{label}
    </Link>
  );
}

/* ── Menu button (actions) ── */
function MobileMenuButton({
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
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "14px 20px",
        fontSize: 15, fontWeight: 700,
        color: danger ? "#ef4444" : "#1A1A1A",
        backgroundColor: "transparent",
        border: "none", cursor: "pointer",
        transition: "background 0.1s",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#f5f5f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {icon}{label}
    </button>
  );
}
