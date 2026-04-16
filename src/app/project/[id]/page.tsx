"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, FolderOpen, StickyNote, Trash2, Pencil, Copy, Check } from "lucide-react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteProject, type Project } from "@/lib/firestore";
import { Header } from "@/components/vault/header";
import { useMobile } from "@/hooks/useMobile";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { SecretsTab } from "@/components/project/secrets-tab";
import { FilesTab } from "@/components/project/files-tab";
import { NotesTab } from "@/components/project/notes-tab";
import { EditProjectModal } from "@/components/project/edit-project-modal";
import { Footer } from "@/components/vault/footer";
import { icons } from "lucide-react";

const WORKSPACE_TABS = [
  { id: "secrets", label: "Secrets", icon: <KeyRound size={15} strokeWidth={2.5} /> },
  { id: "files",   label: "Files",   icon: <FolderOpen size={15} strokeWidth={2.5} /> },
  { id: "notes",   label: "Notes",   icon: <StickyNote size={15} strokeWidth={2.5} /> },
];

export default function ProjectPage() {
  const params   = useParams();
  const router   = useRouter();
  const projectId = params.id as string;

  const isMobile = useMobile();
  const [project,    setProject]   = useState<Project | null>(null);
  const [loading,    setLoading]   = useState(true);
  const [activeTab,  setActiveTab] = useState("secrets");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]  = useState(false);
  const [showEdit,   setShowEdit]  = useState(false);
  const [idCopied,   setIdCopied]  = useState(false);

  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "projects", projectId));
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() } as Project);
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0" }}>
        <Header />
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!project) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0" }}>
        <Header />
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 24, fontWeight: 900 }}>Project not found</h2>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={3} /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = icons[project.icon as keyof typeof icons] ?? icons.Folder;
  const createdLabel = project.createdAt instanceof Timestamp
    ? project.createdAt.toDate().toLocaleDateString()
    : "recently";

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "40px 28px 64px", boxSizing: "border-box" }}>

        {/* ── Mobile: back row (matches header menu chrome - clear target, not cramped by icon row) ── */}
        {isMobile && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              aria-label="Back to projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 42,
                padding: "0 16px",
                borderRadius: 10,
                border: "2px solid #000",
                backgroundColor: "#fff",
                boxShadow: "3px 3px 0 0 #000",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#1A1A1A",
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              Projects
            </button>
          </div>
        )}

        {/* ── Project header ── */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 14 : 16,
          marginBottom: isMobile ? 20 : 32,
        }}>
          {/* Left: back (desktop) + icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Back - desktop only; mobile uses the row above */}
            {!isMobile && (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                aria-label="Back to projects"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 10,
                  border: "2px solid transparent", background: "none", cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s", flexShrink: 0,
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
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
            )}

            {/* Project icon / image */}
            <div style={{
              width: 52, height: 52, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 16, border: "2px solid #000",
              backgroundColor: project.imageUrl ? "transparent" : "#C1F0C1",
              boxShadow: "3px 3px 0 0 #000",
              overflow: "hidden",
            }}>
              {project.imageUrl
                ? (
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    fetchPriority="high"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                )
                : <IconComponent size={24} strokeWidth={2.5} />
              }
            </div>

            {/* Title + date */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: isMobile ? "space-between" : "flex-start",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    minWidth: 0,
                    flex: isMobile ? "1 1 auto" : undefined,
                  }}
                >
                  {project.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => setShowEdit(true)}
                    title="Edit project"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, borderRadius: 8,
                      border: "2px solid transparent", background: "none", cursor: "pointer",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "#fff";
                      e.currentTarget.style.borderColor = "#000";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <Pencil size={14} strokeWidth={2.5} />
                  </button>
                  {/* Delete - inline on mobile only (same row as edit) */}
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setShowDelete(true)}
                      title="Delete project"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 30, height: 30, borderRadius: 8,
                        border: "2px solid transparent", background: "none", cursor: "pointer",
                        transition: "background 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                        e.currentTarget.style.borderColor = "#ef4444";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <Trash2 size={14} strokeWidth={2.5} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>
              {/* One metadata line: date + project id (CLI) */}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "6px 8px",
                  fontSize: 13,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}
              >
                <span>Created {createdLabel}</span>
                <span style={{ color: "#e5e7eb", userSelect: "none" }} aria-hidden>
                  ·
                </span>
                <span style={{ fontWeight: 700, color: "#9ca3af" }}>ID</span>
                <code
                  title={project.id}
                  style={{
                    fontSize: 12,
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 600,
                    color: "#4b5563",
                    backgroundColor: "#f3f4f6",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    maxWidth: isMobile ? "120px" : "min(100%, 280px)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {project.id}
                </code>
                <button
                  type="button"
                  title="Copy project ID (vault-env --project …)"
                  onClick={() => {
                    void navigator.clipboard.writeText(project.id);
                    setIdCopied(true);
                    setTimeout(() => setIdCopied(false), 2000);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    backgroundColor: idCopied ? "#dcfce7" : "#fff",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!idCopied) {
                      e.currentTarget.style.borderColor = "#000";
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = idCopied ? "#dcfce7" : "#fff";
                  }}
                >
                  {idCopied ? (
                    <Check size={14} strokeWidth={2.5} color="#16a34a" />
                  ) : (
                    <Copy size={14} strokeWidth={2.5} color="#6b7280" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: delete (desktop only - mobile uses inline icon next to Edit) */}
          {!isMobile && (
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 size={15} strokeWidth={3} /> Delete
            </Button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ marginBottom: 28 }}>
          <Tabs tabs={WORKSPACE_TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* ── Tab content ── */}
        {activeTab === "secrets" && <SecretsTab projectId={projectId} />}
        {activeTab === "files"   && <FilesTab   projectId={projectId} />}
        {activeTab === "notes"   && <NotesTab   projectId={projectId} />}

      </main>

      {/* ── Edit project modal ── */}
      {project && (
        <EditProjectModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          project={project}
          onUpdated={(updates) => {
            setProject((prev) => prev ? { ...prev, ...updates } : prev);
          }}
        />
      )}

      <Footer />

      {/* ── Delete confirm modal ── */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Project" maxWidth={440}>
        <p style={{ margin: "0 0 24px", fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>
          This will permanently delete <strong>{project.name}</strong> and all its secrets,
          files, and notes. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1, height: 46 }}>
            {deleting ? <Spinner size="sm" className="border-white border-t-transparent" /> : "Yes, Delete"}
          </Button>
          <Button variant="outline" onClick={() => setShowDelete(false)} style={{ flex: 1, height: 46 }}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
