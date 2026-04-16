"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, FileText, FileKey, File as FileIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useVaultStore } from "@/store/vault-store";
import { getFiles, uploadFile, deleteFile, type VaultFile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatFileSize } from "@/lib/utils";

/** Lowercase extensions (images + secrets/config formats). */
const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".pem",
  ".json",
  ".pdf",
  ".key",
  ".crt",
  ".cert",
  ".env",
  ".txt",
  ".yml",
  ".yaml",
  ".toml",
  ".cfg",
  ".conf",
] as const;

const ALLOWED_NAME_RE =
  /\.(png|jpe?g|pem|json|pdf|key|crt|cert|env|txt|yml|yaml|toml|cfg|conf)$/i;

/** For OS file picker + drag-drop hints (MIME quirks vary by browser). */
const DROPZONE_ACCEPT: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/json": [".json"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt", ".env", ".pem", ".key", ".crt", ".cert", ".yml", ".yaml", ".toml", ".cfg", ".conf"],
};

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
    return <FileIcon size={20} strokeWidth={2.5} style={{ color: "#059669" }} />;
  if (lower.endsWith(".pem") || lower.endsWith(".key") || lower.endsWith(".crt"))
    return <FileKey size={20} strokeWidth={2.5} style={{ color: "#d97706" }} />;
  if (lower.endsWith(".json") || lower.endsWith(".yml") || lower.endsWith(".yaml"))
    return <FileText size={20} strokeWidth={2.5} style={{ color: "#2563eb" }} />;
  if (lower.endsWith(".pdf"))
    return <FileText size={20} strokeWidth={2.5} style={{ color: "#dc2626" }} />;
  return <FileIcon size={20} strokeWidth={2.5} style={{ color: "#6b7280" }} />;
}

export function FilesTab({ projectId }: { projectId: string }) {
  const masterPassword = useVaultStore((s) => s.masterPassword);
  const userId         = useVaultStore((s) => s.userId);
  const [files,     setFiles]     = useState<VaultFile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadFiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setFiles(await getFiles(projectId, userId)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [projectId, userId]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!masterPassword || !userId) return;
    setUploading(true);
    try {
      for (const file of accepted) await uploadFile(projectId, userId, file, masterPassword);
      await loadFiles();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  }, [projectId, userId, masterPassword, loadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: DROPZONE_ACCEPT,
    validator: (file) => {
      if (ALLOWED_NAME_RE.test(file.name)) return null;
      return {
        code: "file-invalid-type",
        message: `Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
      };
    },
  });

  async function handleDelete(file: VaultFile) {
    try { await deleteFile(file.id, file.storagePath); setFiles(prev => prev.filter(f => f.id !== file.id)); }
    catch (err) { console.error(err); }
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? "#000" : "#d1d5db"}`,
          borderRadius: 24,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          backgroundColor: isDragActive ? "#e8fbe8" : "#fff",
          marginBottom: 20,
        }}
        onMouseEnter={e => {
          if (!isDragActive) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#000";
            (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f9fafb";
          }
        }}
        onMouseLeave={e => {
          if (!isDragActive) {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#d1d5db";
            (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff";
          }
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Spinner size="lg" />
            <p style={{ fontWeight: 700, color: "#6b7280", margin: 0 }}>Encrypting & uploading...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 52, height: 52,
              backgroundColor: "#C1F0C1", border: "2px solid #000",
              borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "3px 3px 0 0 #000",
            }}>
              <Upload size={22} strokeWidth={2.5} />
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
              .png, .jpg, .jpeg, .pem, .json, .pdf, .key, .crt, .env, .txt, .yml, .toml…
            </p>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {files.map(file => (
            <div key={file.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              backgroundColor: "#fff", border: "2px solid #000",
              borderRadius: 18, padding: "14px 18px",
              boxShadow: "4px 4px 0 0 #000",
              gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  backgroundColor: "#f3f4f6", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {getFileIcon(file.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 14, fontWeight: 700,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    maxWidth: "min(55vw, 380px)",
                  }}>
                    {file.name}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(file)}
                title="Delete file"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, flexShrink: 0,
                  borderRadius: 10, border: "none",
                  backgroundColor: "transparent", cursor: "pointer", transition: "background 0.12s",
                  color: "#ef4444",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>No files uploaded</p>
          <p style={{ margin: 0, fontSize: 14 }}>Drop encrypted files above to get started.</p>
        </div>
      )}
    </div>
  );
}
