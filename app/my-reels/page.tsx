"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Calendar, Trash2, Copy, ExternalLink, Download, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reel } from "@/types";
import { useRouter } from "next/navigation";

export default function MyReelsPage() {
  const reels = useAppStore((state) => state.reels);
  const setActiveReelId = useAppStore((state) => state.setActiveReelId);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const duplicateReel = useAppStore((state) => state.duplicateReel);
  const deleteReel = useAppStore((state) => state.deleteReel);
  const updateReelStatus = useAppStore((state) => state.updateReelStatus);
  const router = useRouter();

  const [exportReel, setExportReel] = useState<Reel | null>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishedReelTitle, setPublishedReelTitle] = useState("");

  const handleStatusChange = (id: string, title: string, status: Reel["status"]) => {
    updateReelStatus(id, status);
    if (status === "published") {
      setPublishedReelTitle(title);
      setShowPublishSuccess(true);
      setTimeout(() => setShowPublishSuccess(false), 4000);
    }
  };

  const handleOpen = (id: string) => {
    setActiveReelId(id);
    setActivePage("create");
    router.push("/create");
  };

  const handleExportText = (reel: Reel) => {
    const rawText = `=== CREATOROS REEL EXPORT ===\nTitle: ${reel.title}\nSource: ${reel.sourceName} (${reel.sourceType})\nDate: ${reel.createdAt}\nVirality Score: ${reel.viralityScore}/100\n\n--- HOOK ---\n${reel.draft.hook}\n\n--- STORY ---\n${reel.draft.story}\n\n--- KEY INSIGHTS ---\n${reel.draft.keyInsights}\n\n--- CTA ---\n${reel.draft.cta}\n\n--- LINKEDIN POST ---\n${reel.draft.linkedInPost}\n\n--- INSTAGRAM CAPTION ---\n${reel.draft.instagramCaption}\n=============================`;
    navigator.clipboard.writeText(rawText);
    alert("Full production package copied to clipboard!");
  };

  const getStatusColor = (status: Reel["status"]) => {
    switch (status) {
      case "published": return { bg: "#F0FDF4", text: "#059669", border: "#BBF7D0" };
      case "generated": return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
      case "archived": return { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" };
      default: return { bg: "#FFF7ED", text: "#D97706", border: "#FED7AA" };
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">My Reels</h1>
            <p className="page-subtitle">
              Manage your content library, edit production scripts, and view virality forecasts
            </p>
          </div>
          <button
            onClick={() => {
              setActivePage("home");
              router.push("/");
            }}
            className="btn btn-primary"
            style={{ fontSize: 13, gap: 6 }}
          >
            <Sparkles size={14} />
            Create From New Idea
          </button>
        </div>
      </div>

      {/* Library Table Card */}
      <div className="card" style={{ overflow: "hidden" }}>
        {reels.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: 15, fontWeight: 500 }}>No reels generated yet. Go back to Discover to create one!</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Source</th>
                <th>Creation Date</th>
                <th>Virality Score</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reels.map((reel) => {
                const statusColors = getStatusColor(reel.status);
                return (
                  <tr key={reel.id}>
                    <td>
                      <div>
                        <div
                          onClick={() => handleOpen(reel.id)}
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            transition: "color 0.15s",
                            maxWidth: 320,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                          {reel.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          Source: {reel.sourceName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {reel.category || "General"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: reel.sourceType === "trend" ? "#F5F3FF" : "#EFF6FF",
                          color: reel.sourceType === "trend" ? "#7C3AED" : "#2563EB",
                          border: `1px solid ${reel.sourceType === "trend" ? "#DDD6FE" : "#BFDBFE"}`
                        }}
                      >
                        {reel.sourceType === "trend" ? "🔥 Trend-Based" : "💡 Custom Idea"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        {reel.createdAt}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#2563EB",
                          background: "#EFF6FF",
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: "1px solid #BFDBFE"
                        }}
                      >
                        {reel.viralityScore}/100
                      </span>
                    </td>
                    <td>
                      <select
                        value={reel.status}
                        onChange={(e) => handleStatusChange(reel.id, reel.title, e.target.value as Reel["status"])}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: statusColors.text,
                          background: statusColors.bg,
                          border: `1px solid ${statusColors.border}`,
                          padding: "4px 8px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          outline: "none"
                        }}
                      >
                        <option value="draft">Draft</option>
                        <option value="generated">Generated</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                        <button
                          onClick={() => handleOpen(reel.id)}
                          className="btn btn-ghost"
                          title="Open & Edit in Content Studio"
                          style={{ padding: "6px", color: "var(--accent)" }}
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => duplicateReel(reel.id)}
                          className="btn btn-ghost"
                          title="Duplicate Reel"
                          style={{ padding: "6px", color: "var(--text-secondary)" }}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(reel.id, reel.title, "published")}
                          className="btn btn-ghost"
                          title="Publish Directly"
                          style={{ padding: "6px", color: "#10B981" }}
                        >
                          🎉
                        </button>
                        <button
                          onClick={() => setExportReel(reel)}
                          className="btn btn-ghost"
                          title="Export Production Package"
                          style={{ padding: "6px", color: "#2563EB" }}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => alert("Bundling B-Roll reference sheets, caption JSONs, custom voiceover tracks, and thumbnail graphics into CreatorOS_Assets.zip!")}
                          className="btn btn-ghost"
                          title="Download Assets Bundle"
                          style={{ padding: "6px", color: "#7C3AED" }}
                        >
                          📦
                        </button>
                        <button
                          onClick={() => deleteReel(reel.id)}
                          className="btn btn-ghost"
                          title="Delete Reel"
                          style={{ padding: "6px", color: "var(--danger)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Export Preview Modal */}
      <AnimatePresence>
        {exportReel && (
          <div
            onClick={() => setExportReel(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 22, 41, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: 20
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: "100%",
                maxWidth: 540,
                background: "white",
                padding: 0,
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                  Export Production Package
                </h3>
                <button
                  onClick={() => setExportReel(null)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: 20, maxHeight: "60vh", overflowY: "auto" }}>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Here is the raw structured script ready for copy or publishing export.
                </p>

                <div
                  style={{
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "var(--text-primary)"
                  }}
                >
                  {`=== CREATOROS REEL EXPORT ===\nTitle: ${exportReel.title}\nSource: ${exportReel.sourceName}\nVirality: ${exportReel.viralityScore}/100\n\n--- HOOK ---\n${exportReel.draft.hook}\n\n--- STORY ---\n${exportReel.draft.story}\n\n--- KEY INSIGHTS ---\n${exportReel.draft.keyInsights}\n\n--- CTA ---\n${exportReel.draft.cta}\n\n--- LINKEDIN ---\n${exportReel.draft.linkedInPost}\n\n--- INSTAGRAM ---\n${exportReel.draft.instagramCaption}`}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "#FAFBFC", justifyContent: "flex-end", gap: 10 }}>
                <button
                  onClick={() => handleExportText(exportReel)}
                  className="btn btn-primary"
                  style={{ fontSize: 13, gap: 6 }}
                >
                  <Copy size={13} />
                  Copy Package
                </button>
                <button
                  onClick={() => setExportReel(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification for publishing success */}
      <AnimatePresence>
        {showPublishSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #10B981",
              boxShadow: "0 10px 30px rgba(16, 185, 129, 0.15)",
              borderRadius: 12,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              backdropFilter: "blur(8px)"
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#D1FAE5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16
            }}>
              🎉
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#065F46" }}>Successfully Published!</div>
              <div style={{ fontSize: 12, color: "#047857", marginTop: 2, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                "{publishedReelTitle}" is now live.
              </div>
            </div>
            <button 
              onClick={() => setShowPublishSuccess(false)}
              style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "#10B981", fontWeight: 700, marginLeft: 10 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
