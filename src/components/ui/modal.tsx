"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    /* Overlay */
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth,
          maxHeight: "calc(100dvh - 40px)",
          overflowY: "auto",
          backgroundColor: "#fff",
          border: "2px solid #000",
          borderRadius: 28,
          padding: "32px",
          boxShadow: "8px 8px 0 0 #000",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24, gap: 12,
        }}>
          {title && (
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em" }}>
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, flexShrink: 0,
              borderRadius: "50%", border: "none",
              backgroundColor: "transparent", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
