"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { useVaultStore } from "@/store/vault-store";
import { getProjects, type Project } from "@/lib/firestore";
import {
  getBillingStatus,
  mustSubscribeForAnotherProject,
  type BillingStatus,
} from "@/lib/billing";
import { Header } from "@/components/vault/header";
import { Footer } from "@/components/vault/footer";
import { SubscriptionRequiredModal } from "@/components/vault/subscription-required-modal";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const router = useRouter();
  const userId = useVaultStore((s) => s.userId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [billing, setBilling] = useState<BillingStatus>({ soloActive: false });

  const loadProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [data, b] = await Promise.all([
        getProjects(userId),
        getBillingStatus(userId),
      ]);
      setProjects(data);
      setBilling(b);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const needsSubscriptionForAnotherProject = mustSubscribeForAnotherProject(
    projects.length,
    billing
  );

  function openNewProject() {
    if (needsSubscriptionForAnotherProject) {
      setShowSubscriptionModal(true);
      return;
    }
    setShowCreateModal(true);
  }

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "48px 28px 64px", boxSizing: "border-box" }}>

        {/* ── Hero section ── */}
        <div style={{ marginBottom: 36 }}>
          {/* Title + button row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
              }}>
                Projects
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
                {projects.length} encrypted vault{projects.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              size="md"
              onClick={openNewProject}
              title={
                needsSubscriptionForAnotherProject
                  ? "Subscribe to Solo to create another project"
                  : "Create a new project"
              }
            >
              <Plus size={16} strokeWidth={3} />
              New Project
            </Button>
          </div>

          {/* Full-width search */}
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              strokeWidth={2.5}
              color="#9ca3af"
              style={{
                position: "absolute", left: 16,
                top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 16px 12px 44px",
                borderRadius: 16,
                border: "2px solid #000",
                backgroundColor: "#fff",
                fontSize: 15, fontWeight: 500, color: "#1A1A1A",
                outline: "none",
                boxShadow: "4px 4px 0 0 #000",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "4px 4px 0 0 #3a9a3a";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "4px 4px 0 0 #000";
              }}
            />
          </div>
        </div>

        {needsSubscriptionForAnotherProject && projects.length > 0 && (
          <div
            style={{
              marginBottom: 24,
              padding: "14px 18px",
              borderRadius: 16,
              border: "2px solid #000",
              backgroundColor: "#fff",
              boxShadow: "4px 4px 0 0 #000",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              lineHeight: 1.45,
            }}
          >
            <strong style={{ color: "#1A1A1A" }}>Free tier:</strong> one project.{" "}
            <button
              type="button"
              onClick={() => setShowSubscriptionModal(true)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                fontWeight: 800,
                color: "#3a9a3a",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Subscribe to Solo
            </button>{" "}
            ($5/mo) to add more vaults.
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <Spinner size="lg" />
          </div>

        ) : filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}>
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                {...project}
                index={i}
                onClick={() => router.push(`/project/${project.id}`)}
              />
            ))}
          </div>

        ) : projects.length === 0 ? (
          /* Empty state  -  sits directly below the search, no huge top gap */
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", paddingTop: 56,
          }}>
            <div style={{
              width: 76, height: 76,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 26, border: "2px solid #000",
              backgroundColor: "#C1F0C1", boxShadow: "5px 5px 0 0 #000",
              marginBottom: 22,
            }}>
              <ShieldCheck size={34} strokeWidth={2.5} />
            </div>

            <h2 style={{
              margin: "0 0 10px",
              fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em",
            }}>
              No projects yet
            </h2>
            <p style={{
              margin: "0 0 28px",
              fontSize: 15, color: "#9ca3af",
              maxWidth: 300, lineHeight: 1.6,
            }}>
              Create your first encrypted project to start managing secrets, files, and notes.
            </p>

            <Button size="lg" onClick={openNewProject}>
              <Plus size={18} strokeWidth={3} />
              Create First Project
            </Button>
          </div>

        ) : (
          <p style={{ textAlign: "center", color: "#9ca3af", paddingTop: 48, fontSize: 15 }}>
            No projects match &ldquo;{search}&rdquo;
          </p>
        )}
      </main>

      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadProjects}
        onSubscriptionRequired={() => setShowSubscriptionModal(true)}
      />

      <SubscriptionRequiredModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      <Footer />
    </div>
  );
}
