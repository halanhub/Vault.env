"use client";

import { useState, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PROJECT_ICONS } from "@/lib/utils";
import { createProject, uploadProjectImage } from "@/lib/firestore";
import { SUBSCRIPTION_REQUIRED_ERROR } from "@/lib/billing";
import { useVaultStore } from "@/store/vault-store";
import { icons, Upload, ImageIcon, Shapes, X } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  /** Fired when server rejects create because Solo subscription is required */
  onSubscriptionRequired?: () => void;
}

type Tab = "icons" | "image";

export function CreateProjectModal({ open, onClose, onCreated, onSubscriptionRequired }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [tab, setTab] = useState<Tab>("icons");
  const [selectedIcon, setSelectedIcon] = useState("Shield");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = useVaultStore((s) => s.userId);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, SVG, WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be under 4 MB.");
      return;
    }
    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Project name is required."); return; }
    if (tab === "image" && !imageFile) { setError("Please upload an image or switch to icons."); return; }
    if (!userId) return;

    setLoading(true);
    setError("");
    try {
      let imageUrl: string | undefined;
      if (tab === "image" && imageFile) {
        imageUrl = await uploadProjectImage(userId, imageFile);
      }
      await createProject(userId, name.trim(), selectedIcon, imageUrl);
      // reset
      setName(""); setSelectedIcon("Shield");
      clearImage(); setTab("icons");
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project.";
      if (msg === SUBSCRIPTION_REQUIRED_ERROR) {
        onClose();
        onSubscriptionRequired?.();
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Project" maxWidth={500}>
      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

        <Input
          id="projectName"
          label="Project Name"
          placeholder="my-saas-app"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* ── Tab toggle ── */}
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Project Logo
          </p>

          {/* Tab pills */}
          <div style={{
            display: "inline-flex", gap: 4,
            padding: 4, borderRadius: 12,
            border: "2px solid #000", backgroundColor: "#f9fafb",
            marginBottom: 16,
          }}>
            {([
              { id: "icons", label: "Icons", icon: <Shapes size={14} strokeWidth={2.5} /> },
              { id: "image", label: "Upload Image", icon: <ImageIcon size={14} strokeWidth={2.5} /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setError(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8, border: "none",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  transition: "background 0.15s, box-shadow 0.15s",
                  backgroundColor: tab === t.id ? "#1A1A1A" : "transparent",
                  color: tab === t.id ? "#fff" : "#6b7280",
                  boxShadow: tab === t.id ? "2px 2px 0 0 #000" : "none",
                }}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* ── Icons panel ── */}
          {tab === "icons" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
            }}>
              {PROJECT_ICONS.map((iconName) => {
                const Icon = icons[iconName as keyof typeof icons] ?? icons.Folder;
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    style={{
                      aspectRatio: "1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 14,
                      border: `2px solid ${isSelected ? "#000" : "#e5e7eb"}`,
                      backgroundColor: isSelected ? "#C1F0C1" : "#fff",
                      boxShadow: isSelected ? "3px 3px 0 0 #000" : "none",
                      cursor: "pointer",
                      transition: "all 0.12s",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "#000"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Image upload panel ── */}
          {tab === "image" && (
            <div>
              {imagePreview ? (
                /* Preview */
                <div style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px",
                  border: "2px solid #000", borderRadius: 16,
                  backgroundColor: "#f9fafb",
                  boxShadow: "3px 3px 0 0 #000",
                }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    decoding="async"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      objectFit: "contain",
                      objectPosition: "center",
                      backgroundColor: "#f3f4f6",
                      border: "2px solid #000",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {imageFile?.name}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                      {imageFile ? (imageFile.size / 1024).toFixed(0) + " KB" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: "50%",
                      border: "none", backgroundColor: "#fee2e2", cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <X size={14} color="#dc2626" strokeWidth={3} />
                  </button>
                </div>
              ) : (
                /* Drop zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 10, padding: "32px 16px",
                    border: `2px dashed ${isDragging ? "#1A1A1A" : "#d1d5db"}`,
                    borderRadius: 16,
                    backgroundColor: isDragging ? "#f0fdf0" : "#fafafa",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 12, border: "2px solid #000",
                    backgroundColor: "#C1F0C1", boxShadow: "3px 3px 0 0 #000",
                  }}>
                    <Upload size={20} strokeWidth={2.5} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                      {isDragging ? "Drop it here!" : "Drop image or click to browse"}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
                      PNG, JPG, SVG, WebP · max 4 MB
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
            </div>
          )}
        </div>

        {error && (
          <p style={{
            margin: 0, padding: "10px 14px",
            borderRadius: 10, border: "1px solid #fca5a5",
            backgroundColor: "#fef2f2",
            fontSize: 13, fontWeight: 600, color: "#dc2626",
          }}>
            {error}
          </p>
        )}

        <Button type="submit" size="lg" variant="primary" className="w-full" style={{ height: 52 }} disabled={loading}>
          {loading
            ? <Spinner size="sm" className="border-white border-t-transparent" />
            : "Create Project"
          }
        </Button>

      </form>
    </Modal>
  );
}
