"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, Wand2, BarChart2, ExternalLink } from "lucide-react";
import { Trend, Source } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

const SOURCE_COLORS: Record<string, string> = {
  Reddit: "#FF4500",
  LinkedIn: "#0077B5",
  YouTube: "#FF0000",
  News: "#6B7280",
  "Social Trends": "#7C3AED", // Purple for mapped social trends
};

const mapSource = (src: string) => {
  if (["Twitter", "TikTok", "HackerNews", "Google Trends", "Instagram", "Social Trends"].includes(src)) {
    return "Social Trends";
  }
  return src; // Reddit, LinkedIn, YouTube, News
};

export default function TrendCard({ trend, index }: { trend: Trend; index: number }) {
  const [showWhy, setShowWhy] = useState(false);
  const router = useRouter();
  const generateReelWithWorkflow = useAppStore((state) => state.generateReelWithWorkflow);
  const setSelectedTrend = useAppStore((state) => state.setSelectedTrend);
  const beginnerMode = useAppStore((state) => state.beginnerMode);

  // Mapped sources
  const mappedSources = Array.from(new Set(trend.sources.map(mapSource)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card card-hover"
      style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}
    >
      <div>
        {/* Beginner Tip if active */}
        {beginnerMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#FFF9E6", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 12 }}>
            <span style={{ fontSize: 12 }}>💡</span>
            <span style={{ fontSize: 11, color: "#92400E", fontWeight: 600, lineHeight: 1.3 }}>
              {trend.scores.overall >= 88 
                ? "Highly recommended topic. Algorithm is currently boosting search traffic." 
                : "Good opportunity. Keep editing simple and focus on a clear hook concept."}
            </span>
          </div>
        )}

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: trend.growthLevel === "explosive" ? "#FEF2F2" : trend.growthLevel === "high" ? "#FFF7ED" : "#F0FDF4",
                  color: trend.growthLevel === "explosive" ? "#DC2626" : trend.growthLevel === "high" ? "#D97706" : "#059669",
                  border: `1px solid ${trend.growthLevel === "explosive" ? "#FECACA" : trend.growthLevel === "high" ? "#FED7AA" : "#BBF7D0"}`,
                }}
              >
                {trend.growthLevel === "explosive" ? "🔥 Explosive" : trend.growthLevel === "high" ? "⚡ High Growth" : "📈 Growing"}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#F5F7FA",
                  color: "#6B7280",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {trend.category}
              </span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
              {trend.name}
            </h3>
          </div>

          {/* Score ring */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: trend.scores.overall >= 90
                ? "linear-gradient(135deg, #059669, #10B981)"
                : trend.scores.overall >= 80
                ? "linear-gradient(135deg, #2563EB, #3B82F6)"
                : "linear-gradient(135deg, #D97706, #F59E0B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
              marginLeft: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {trend.scores.overall}
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { label: "Growth", value: `+${trend.scores.growth}%`, color: "#059669" },
            { label: "Virality", value: `${trend.scores.virality}/100`, color: "#D97706" },
            { label: "Search", value: `${trend.scores.searchInterest}/100`, color: "#2563EB" },
            { label: "Engagement", value: `${trend.scores.engagementPotential}/100`, color: "#7C3AED" },
            { label: "Novelty", value: `${trend.scores.novelty}/100`, color: "#0891B2" },
            { label: "Audience", value: `${trend.scores.audienceRelevance}/100`, color: "#BE185D" },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                padding: "6px 8px",
                background: "#FAFBFC",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                {m.label}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Estimated Reach */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "#FAFBFF",
            borderRadius: 8,
            border: "1px solid #EEF2FF",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>Estimated Reach</div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#2563EB", display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={13} />
            {trend.scores.estimatedReach}
          </div>
        </div>

        {/* Expandable Why This Score */}
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowWhy(!showWhy); }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              background: "#F8FAFC",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--text-secondary)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <span>🤔 Why This Score?</span>
            <motion.span animate={{ rotate: showWhy ? 180 : 0 }}>
              <ChevronDown size={13} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showWhy && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "10px",
                    background: "#FAFBFC",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "0 0 8px 8px",
                    fontSize: 11.5,
                    color: "var(--text-secondary)",
                    lineHeight: 1.45,
                    marginTop: -1,
                    borderTop: "none"
                  }}
                >
                  <strong>AI Analysis:</strong> Ranks highly at {trend.scores.overall}/100 due to +{trend.scores.growth}% Growth velocity, strong engagement potential ({trend.scores.engagementPotential}/100), and fresh novelty ({trend.scores.novelty}/100). Highly recommended content opportunity.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sources */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
          {mappedSources.map((src) => (
            <span key={src} className="source-badge" style={{ color: SOURCE_COLORS[src] ?? "var(--text-secondary)" }}>
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        {trend.url && trend.url !== "#" && (
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: 12.5, padding: "8px 12px", textDecoration: "none", background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" }}
          >
            <ExternalLink size={12} />
            Watch Original Reel
          </a>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              generateReelWithWorkflow(trend.name, "trend", trend.category, trend, router);
            }}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center", fontSize: 12.5, padding: "8px 12px", border: "none", cursor: "pointer" }}
          >
            <Wand2 size={12} />
            Create Content
          </button>
          <Link
            href="/analyze"
            onClick={() => setSelectedTrend(trend)}
            className="btn btn-secondary"
            style={{ gap: 4, fontSize: 12.5, padding: "8px 12px", textDecoration: "none" }}
          >
            <BarChart2 size={12} />
            Analysis
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
