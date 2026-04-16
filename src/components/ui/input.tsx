"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, style, ...props }, ref) => {
    return (
      <div style={{ width: "100%" }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#1A1A1A",
              marginBottom: 6,
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: `2px solid ${error ? "#ef4444" : "#000"}`,
            backgroundColor: "#fff",
            color: "#1A1A1A",
            fontSize: 15,
            fontWeight: 500,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s, box-shadow 0.15s",
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,215,140,0.5)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          className={className}
          {...props}
        />
        {error && (
          <p style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
