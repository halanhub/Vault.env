"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { FREE_PROJECT_LIMIT } from "@/lib/billing";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL;

interface SubscriptionRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionRequiredModal({ open, onClose }: SubscriptionRequiredModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Solo subscription required" maxWidth={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#4b5563", lineHeight: 1.55 }}>
          The free tier includes <strong style={{ color: "#1A1A1A" }}>{FREE_PROJECT_LIMIT} project</strong>.
          To create another encrypted vault, subscribe to Solo ($5/month).
        </p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280", lineHeight: 1.5 }}>
          Use the same email as this Vault.env account when you check out. After payment, Solo is activated on
          your profile so you can add more projects.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full touch-manipulation select-none items-center justify-center gap-2 rounded-full font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              style={{
                height: 48,
                fontSize: 15,
                letterSpacing: "-0.02em",
                backgroundColor: "#1A1A1A",
                color: "#fff",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 0 #000",
                textDecoration: "none",
              }}
            >
              <CreditCard size={16} strokeWidth={2.5} />
              Open checkout
            </a>
          ) : (
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#9ca3af", textAlign: "center" }}>
              Configure <code style={{ fontSize: 12 }}>NEXT_PUBLIC_CHECKOUT_URL</code> to show a payment link here.
              You can still use <strong>Subscribe</strong> in the header when checkout is configured.
            </p>
          )}
          <Button type="button" variant="outline" size="md" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
