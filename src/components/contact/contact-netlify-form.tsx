"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Netlify Forms + Next.js: submissions must POST to a **static file** under `public/`, not `/`.
 * Otherwise the Next runtime handles the request and Netlify never records the submission.
 * See https://opennext.js.org/netlify/forms
 *
 * No email address is required in code. Configure submission notifications under
 * Netlify → Site configuration → Notifications → Form submission notifications.
 */
export function ContactNetlifyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError("");
    setSubmitting(true);

    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, typeof value === "string" ? value : value.name);
    }

    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (res.ok) {
        window.location.assign("/contact/thanks");
        return;
      }
      setError(`Something went wrong (${res.status}). Try again or email us from your client.`);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <input type="hidden" name="form-name" value="contact" />

      <p style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden>
        <label>
          Don&apos;t fill this out if you&apos;re human:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <Input id="contact-name" name="name" type="text" label="Name" required autoComplete="name" disabled={submitting} />

      <Input
        id="contact-email"
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
        disabled={submitting}
      />

      <Textarea
        id="contact-message"
        name="message"
        label="Message"
        required
        rows={6}
        disabled={submitting}
      />

      {error ? (
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#b91c1c" }} role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: 8,
          alignSelf: "flex-start",
          padding: "14px 28px",
          borderRadius: 999,
          border: "2px solid #000",
          backgroundColor: submitting ? "#e5e7eb" : "#C1F0C1",
          color: "#1A1A1A",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          cursor: submitting ? "wait" : "pointer",
          boxShadow: submitting ? "none" : "4px 4px 0 0 #000",
        }}
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
