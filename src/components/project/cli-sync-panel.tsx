"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

export function CliSyncPanel({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cliPackage =
    process.env.NEXT_PUBLIC_VAULT_ENV_CLI_PACKAGE?.trim() || "@vaultenv/cli";
  /** Pin version so npx does not reuse an ancient cached 0.1.0 install ("Firebase email" prompts). Override via env when you ship a newer CLI. */
  const cliVersion =
    process.env.NEXT_PUBLIC_VAULT_ENV_CLI_VERSION?.trim() || "0.1.6";

  const commands = useMemo(() => {
    const npx = `npx ${cliPackage}@${cliVersion}`;
    return {
      login: `${npx} login`,
      pull: `${npx} pull --project ${projectId} -o .env`,
      push: `${npx} push --project ${projectId} -f .env`,
    };
  }, [cliPackage, cliVersion, projectId]);

  async function copyLine(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      style={{
        marginBottom: 20,
        backgroundColor: "#fff",
        border: "2px solid #000",
        borderRadius: 18,
        boxShadow: "4px 4px 0 0 #000",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          border: "none",
          background: open ? "#f9fafb" : "#fff",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
        }}
      >
        <Terminal size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.03em", flex: 1 }}>
          Use these secrets on your computer
        </span>
        {open ? (
          <ChevronDown size={18} strokeWidth={2.5} />
        ) : (
          <ChevronRight size={18} strokeWidth={2.5} />
        )}
      </button>

      {open && (
        <div
          style={{
            padding: "0 16px 16px",
            borderTop: "1px solid #e5e7eb",
            fontSize: 13,
            color: "#4b5563",
            lineHeight: 1.55,
          }}
        >
          <p style={{ margin: "14px 0 12px", fontSize: 14 }}>
            Install the CLI, then use the same email and password as this site. For{" "}
            <strong>pull</strong> and <strong>push</strong>, enter your vault master password when
            asked. Nothing else to download - the tool connects to Vault.env automatically. The
            commands below already include <strong>this project</strong>.
          </p>

          <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 12, color: "#111" }}>
            1. Install
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6b7280" }}>
            <code style={{ fontSize: 12 }}>npm install -g {cliPackage}@{cliVersion}</code>
            <span style={{ display: "block", marginTop: 6, fontSize: 12 }}>
              Or use <code style={{ fontSize: 12 }}>npx</code> with each command below (version{" "}
              <code style={{ fontSize: 12 }}>@{cliVersion}</code> is included).
            </span>
          </p>

          <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 12, color: "#111" }}>
            2. Sign in once
          </p>
          <CommandRow
            text={commands.login}
            copied={copiedKey === "login"}
            onCopy={() => copyLine("login", commands.login)}
          />

          <p style={{ margin: "14px 0 8px", fontWeight: 800, fontSize: 12, color: "#111" }}>
            3. Pull secrets into a .env file
          </p>
          <CommandRow
            text={commands.pull}
            copied={copiedKey === "pull"}
            onCopy={() => copyLine("pull", commands.pull)}
          />

          <p style={{ margin: "14px 0 8px", fontWeight: 800, fontSize: 12, color: "#111" }}>
            4. Push changes (optional)
          </p>
          <CommandRow
            text={commands.push}
            copied={copiedKey === "push"}
            onCopy={() => copyLine("push", commands.push)}
          />
        </div>
      )}
    </div>
  );
}

function CommandRow({
  text,
  copied,
  onCopy,
}: {
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        backgroundColor: "#fafafa",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 10px 10px 12px",
      }}
    >
      <pre
        style={{
          margin: 0,
          flex: 1,
          minWidth: 0,
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          color: "#1f2937",
        }}
      >
        {text}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        title="Copy"
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          backgroundColor: copied ? "#dcfce7" : "#fff",
          cursor: "pointer",
        }}
      >
        {copied ? (
          <Check size={15} strokeWidth={2.5} color="#16a34a" />
        ) : (
          <Copy size={15} strokeWidth={2.5} color="#6b7280" />
        )}
      </button>
    </div>
  );
}
