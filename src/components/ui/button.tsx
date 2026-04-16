"use client";

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary:   { backgroundColor: "#1A1A1A", color: "#fff",       border: "2px solid #000", boxShadow: "4px 4px 0 0 #000" },
  secondary: { backgroundColor: "#C1F0C1", color: "#1A1A1A",    border: "2px solid #000", boxShadow: "4px 4px 0 0 #000" },
  outline:   { backgroundColor: "#fff",    color: "#1A1A1A",    border: "2px solid #000", boxShadow: "4px 4px 0 0 #000" },
  ghost:     { backgroundColor: "transparent", color: "#1A1A1A", border: "2px solid transparent", boxShadow: "none" },
  danger:    { backgroundColor: "#ef4444", color: "#fff",        border: "2px solid #000", boxShadow: "4px 4px 0 0 #000" },
};

const SIZE_STYLES: Record<string, CSSProperties> = {
  sm: { fontSize: 13, padding: "8px 16px" },
  md: { fontSize: 15, padding: "10px 22px" },
  lg: { fontSize: 16, padding: "14px 28px" },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn("inline-flex items-center justify-center gap-2 rounded-full font-bold select-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none touch-manipulation", className)}
        style={{
          ...VARIANT_STYLES[variant],
          ...SIZE_STYLES[size],
          letterSpacing: "-0.02em",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
