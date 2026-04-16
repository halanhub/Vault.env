"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Netlify Forms-compatible contact form with the same input focus glow as auth (Input/Textarea).
 */
export function ContactNetlifyForm() {
  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      action="/contact/thanks"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <input type="hidden" name="form-name" value="contact" />

      <p style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden>
        <label>
          Don&apos;t fill this out if you&apos;re human:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <Input id="contact-name" name="name" type="text" label="Name" required autoComplete="name" />

      <Input
        id="contact-email"
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
      />

      <Textarea id="contact-message" name="message" label="Message" required rows={6} />

      <button
        type="submit"
        style={{
          marginTop: 8,
          alignSelf: "flex-start",
          padding: "14px 28px",
          borderRadius: 999,
          border: "2px solid #000",
          backgroundColor: "#C1F0C1",
          color: "#1A1A1A",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          cursor: "pointer",
          boxShadow: "4px 4px 0 0 #000",
        }}
      >
        Send message
      </button>
    </form>
  );
}
