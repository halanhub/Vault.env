"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { Save, Eye, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useVaultStore } from "@/store/vault-store";
import { getNote, saveNote } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Block javascript:, data:, and exotic schemes in user-written Markdown preview. */
function isSafeMarkdownHref(href: string): boolean {
  const t = href.trim();
  const lower = t.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }
  if (t.startsWith("#") || t.startsWith("/") || t.startsWith("./") || t.startsWith("../")) {
    return true;
  }
  if (lower.startsWith("mailto:")) return true;
  if (!t.includes(":")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function SafeMdLink({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  if (!href || !isSafeMarkdownHref(href)) {
    return (
      <span style={{ color: "#9ca3af", textDecoration: "line-through" }} title="Unsafe link removed">
        {children}
      </span>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      style={{ color: "#16a34a", textDecoration: "underline" }}
    >
      {children}
    </a>
  );
}

export function NotesTab({ projectId }: { projectId: string }) {
  const masterPassword = useVaultStore((s) => s.masterPassword);
  const userId = useVaultStore((s) => s.userId);
  const [content,   setContent]   = useState("");
  const [noteId,    setNoteId]    = useState<string | undefined>();
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [preview,   setPreview]   = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNote = useCallback(async () => {
    if (!masterPassword || !userId) return;
    setLoading(true);
    try {
      const note = await getNote(projectId, userId, masterPassword);
      if (note) { setContent(note.content); setNoteId(note.id); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [projectId, userId, masterPassword]);

  useEffect(() => { loadNote(); }, [loadNote]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  async function handleSave() {
    if (!masterPassword || !userId) return;
    setSaving(true);
    try {
      const id = await saveNote(projectId, userId, content, masterPassword, noteId);
      setNoteId(id); setLastSaved(new Date());
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function handleChange(value: string) {
    setContent(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleSave, 3000);
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, gap: 12, flexWrap: "wrap",
      }}>
        {/* Edit / Preview toggle */}
        <div style={{
          display: "inline-flex", gap: 4, padding: 4,
          backgroundColor: "#fff", border: "2px solid #000",
          borderRadius: 999, boxShadow: "3px 3px 0 0 #000",
        }}>
          {[
            { label: "Edit",    icon: <Pencil size={13} strokeWidth={3} />, active: !preview, onClick: () => setPreview(false) },
            { label: "Preview", icon: <Eye    size={13} strokeWidth={3} />, active:  preview, onClick: () => setPreview(true)  },
          ].map(({ label, icon, active, onClick }) => (
            <button key={label} type="button" onClick={onClick} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 999, border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              backgroundColor: active ? "#1A1A1A" : "transparent",
              color: active ? "#fff" : "#6b7280",
              boxShadow: active ? "2px 2px 0 0 #000" : "none",
              transition: "background 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Save + last saved */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastSaved && (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving
              ? <Spinner size="sm" className="border-white border-t-transparent" />
              : <><Save size={13} strokeWidth={3} /> Save</>}
          </Button>
        </div>
      </div>

      {/* Editor / Preview panel */}
      <div style={{
        backgroundColor: "#fff", border: "2px solid #000",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "6px 6px 0 0 #000",
        minHeight: 400,
      }}>
        {preview ? (
          <div style={{
            padding: "28px 32px", minHeight: 400,
            fontSize: 15, lineHeight: 1.75, color: "#1A1A1A",
          }}>
            {content
              ? <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em", margin: "24px 0 12px" }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 800, margin: "20px 0 10px" }}>{children}</h3>,
                    p:  ({ children }) => <p  style={{ margin: "0 0 14px" }}>{children}</p>,
                    code: ({ children }) => <code style={{ backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: 13 }}>{children}</code>,
                    pre: ({ children }) => <pre style={{ backgroundColor: "#f3f4f6", padding: "14px 18px", borderRadius: 10, overflowX: "auto", fontFamily: "monospace", fontSize: 13, margin: "0 0 14px" }}>{children}</pre>,
                    ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: "0 0 14px" }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: "0 0 14px" }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                    a: ({ href, children }) => (
                      <SafeMdLink href={href}>{children}</SafeMdLink>
                    ),
                    blockquote: ({ children }) => <blockquote style={{ borderLeft: "4px solid #C1F0C1", paddingLeft: 16, color: "#6b7280", margin: "0 0 14px" }}>{children}</blockquote>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              : <p style={{ color: "#9ca3af", fontStyle: "italic", margin: 0 }}>Nothing to preview yet.</p>
            }
          </div>
        ) : (
          <textarea
            value={content}
            onChange={e => handleChange(e.target.value)}
            placeholder={"# Project Notes\n\nWrite your notes in Markdown..."}
            style={{
              display: "block", width: "100%", minHeight: 400,
              padding: "28px 32px", boxSizing: "border-box",
              fontFamily: "monospace", fontSize: 14, lineHeight: 1.7,
              color: "#1A1A1A", backgroundColor: "transparent",
              border: "none", outline: "none", resize: "vertical",
            }}
          />
        )}
      </div>
    </div>
  );
}
