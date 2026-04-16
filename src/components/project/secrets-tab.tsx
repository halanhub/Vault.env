"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, Upload, Copy, Check, Pencil, X } from "lucide-react";
import { useVaultStore } from "@/store/vault-store";
import { getSecrets, addSecret, updateSecret, deleteSecret, bulkImportSecrets } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";

interface SecretRow { id: string; key: string; value: string; }

export function SecretsTab({ projectId }: { projectId: string }) {
  const masterPassword = useVaultStore((s) => s.masterPassword);
  const userId = useVaultStore((s) => s.userId);
  const [secrets,    setSecrets]    = useState<SecretRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const [copiedId,   setCopiedId]   = useState<string | null>(null);

  const [showAdd,   setShowAdd]   = useState(false);
  const [newKey,    setNewKey]    = useState("");
  const [newValue,  setNewValue]  = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editId,     setEditId]    = useState<string | null>(null);
  const [editKey,    setEditKey]   = useState("");
  const [editValue,  setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [showBulk,  setShowBulk]  = useState(false);
  const [bulkText,  setBulkText]  = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadSecrets = useCallback(async () => {
    if (!masterPassword || !userId) return;
    setLoading(true);
    try { setSecrets(await getSecrets(projectId, userId, masterPassword)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [projectId, userId, masterPassword]);

  useEffect(() => { loadSecrets(); }, [loadSecrets]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim() || !masterPassword || !userId) return;
    setAddLoading(true);
    try {
      await addSecret(projectId, userId, newKey.trim(), newValue, masterPassword);
      setNewKey(""); setNewValue(""); setShowAdd(false);
      await loadSecrets();
    } finally { setAddLoading(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !editKey.trim() || !masterPassword) return;
    setEditLoading(true);
    try {
      await updateSecret(editId, projectId, editKey.trim(), editValue, masterPassword);
      setEditId(null); await loadSecrets();
    } finally { setEditLoading(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteSecret(id); setSecrets(prev => prev.filter(s => s.id !== id)); }
    catch (err) { console.error(err); }
  }

  async function handleBulkImport(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim() || !masterPassword || !userId) return;
    setBulkLoading(true);
    try {
      await bulkImportSecrets(projectId, userId, bulkText, masterPassword);
      setBulkText(""); setShowBulk(false); await loadSecrets();
    } finally { setBulkLoading(false); }
  }

  function toggleVisible(id: string) {
    setVisibleIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function copyValue(value: string, id: string) {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={15} strokeWidth={3} /> Add Secret
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowBulk(true)}>
          <Upload size={15} strokeWidth={3} /> Bulk Import
        </Button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{
            backgroundColor: "#fff", border: "2px solid #000",
            borderRadius: 18, padding: "20px",
            boxShadow: "4px 4px 0 0 #000", marginBottom: 20,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}
               className="secret-grid">
            <Input id="newKey" label="Key" placeholder="DATABASE_URL" value={newKey} onChange={e => setNewKey(e.target.value)} autoFocus />
            <Input id="newValue" label="Value" placeholder="postgres://..." value={newValue} onChange={e => setNewValue(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button type="submit" size="sm" disabled={addLoading}>
              {addLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : "Save"}
            </Button>
            <button type="button" onClick={() => setShowAdd(false)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 999, border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#6b7280" }}>
              <X size={14} strokeWidth={3} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Secrets table */}
      {secrets.length > 0 ? (
        <div style={{
          backgroundColor: "#fff", border: "2px solid #000",
          borderRadius: 24, overflow: "hidden", boxShadow: "6px 6px 0 0 #000",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #000", backgroundColor: "#f9fafb" }}>
                  {["KEY", "VALUE", "ACTIONS"].map((h, i) => (
                    <th key={h} style={{
                      padding: "14px 20px", textAlign: i === 2 ? "right" : "left",
                      fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", color: "#6b7280",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {secrets.map((secret, i) => (
                  <tr key={secret.id} style={{
                    borderBottom: i < secrets.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <code style={{
                        fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                        backgroundColor: "#f3f4f6", padding: "3px 8px",
                        borderRadius: 6, border: "1px solid #e5e7eb",
                      }}>
                        {secret.key}
                      </code>
                    </td>
                    <td style={{ padding: "14px 20px", maxWidth: 320 }}>
                      <span style={{
                        fontSize: 13, fontFamily: "monospace", color: "#374151",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        display: "block",
                      }}>
                        {visibleIds.has(secret.id)
                          ? secret.value
                          : "•".repeat(Math.min(secret.value.length || 8, 24))}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                        {[
                          {
                            icon: visibleIds.has(secret.id) ? <EyeOff size={15} strokeWidth={2.5} /> : <Eye size={15} strokeWidth={2.5} />,
                            action: () => toggleVisible(secret.id), title: "Toggle visibility",
                          },
                          {
                            icon: copiedId === secret.id ? <Check size={15} strokeWidth={2.5} color="#16a34a" /> : <Copy size={15} strokeWidth={2.5} />,
                            action: () => copyValue(secret.value, secret.id), title: "Copy",
                          },
                          {
                            icon: <Pencil size={15} strokeWidth={2.5} />,
                            action: () => { setEditId(secret.id); setEditKey(secret.key); setEditValue(secret.value); },
                            title: "Edit",
                          },
                          {
                            icon: <Trash2 size={15} strokeWidth={2.5} color="#ef4444" />,
                            action: () => handleDelete(secret.id), title: "Delete", danger: true,
                          },
                        ].map(({ icon, action, title, danger }, idx) => (
                          <button key={idx} type="button" onClick={action} title={title}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              width: 32, height: 32, borderRadius: 8, border: "none",
                              backgroundColor: "transparent", cursor: "pointer", transition: "background 0.12s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : "#f3f4f6")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>No secrets yet</p>
          <p style={{ margin: 0, fontSize: 14 }}>Add your first environment variable above.</p>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Secret" maxWidth={460}>
        <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input id="editKey" label="Key" value={editKey} onChange={e => setEditKey(e.target.value)} />
          <Input id="editValue" label="Value" value={editValue} onChange={e => setEditValue(e.target.value)} />
          <Button type="submit" className="w-full" style={{ height: 48 }} disabled={editLoading}>
            {editLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : "Update Secret"}
          </Button>
        </form>
      </Modal>

      {/* Bulk import modal */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Import .env" maxWidth={480}>
        <form onSubmit={handleBulkImport} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              Paste your .env content
            </label>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=sk-...\nSECRET=myvalue"}
              rows={10}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 14px", borderRadius: 14,
                border: "2px solid #000", outline: "none",
                fontFamily: "monospace", fontSize: 13,
                resize: "vertical", backgroundColor: "#fafafa",
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(140,215,140,0.4)")}
              onBlur={e => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>
          <Button type="submit" className="w-full" style={{ height: 48 }} disabled={bulkLoading}>
            {bulkLoading
              ? <Spinner size="sm" className="border-white border-t-transparent" />
              : <><Upload size={15} strokeWidth={3} /> Import Secrets</>}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
