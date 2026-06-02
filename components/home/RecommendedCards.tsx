"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, Wand2, BarChart2, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTrends } from "@/lib/api";
import { Trend } from "@/types";
import TrendAnalysisModal from "./TrendAnalysisModal";
import QuickPreferenceSelector from "./QuickPreferenceSelector";

function SkeletonCard() {
  return (
    <div
      className="card animate-pulse"
      style={{
        minWidth: 300,
        padding: "20px",
        flexShrink: 0,
        background: "white",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 80, height: 20, background: "#E2E8F0", borderRadius: 99 }} />
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#E2E8F0" }} />
      </div>
      <div style={{ width: "80%", height: 18, background: "#E2E8F0", borderRadius: 4 }} />
      <div style={{ width: "95%", height: 14, background: "#F1F5F9", borderRadius: 4 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <div style={{ flex: 1, height: 32, background: "#E2E8F0", borderRadius: 6 }} />
        <div style={{ flex: 1, height: 32, background: "#E2E8F0", borderRadius: 6 }} />
      </div>
    </div>
  );
}

export default function RecommendedCards() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  const router = useRouter();
  const createReelFromIdea = useAppStore((state) => state.createReelFromIdea);

  const creatorProfile = useAppStore((state) => state.creatorProfile);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrends();
      const filtered = data.filter(t => t.category.toLowerCase() === creatorProfile.category.toLowerCase());
      setTrends(filtered.length > 0 ? filtered : data.slice(0, 5));
    } catch (err: any) {
      setError(err.message || "Failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [creatorProfile.category]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h2 className="section-heading" style={{ marginBottom: 2 }}>Recommended For You</h2>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Curated by AI based on your content strategy</p>
        </div>
        <Link
          href="/explore"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View all <ArrowUpRight size={13} />
        </Link>
      </div>

      <QuickPreferenceSelector />

      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
        {loading ? (
          // Skeleton Cards
          [1, 2, 3].map((n) => <SkeletonCard key={n} />)
        ) : error ? (
          // Error UI
          <div
            className="card"
            style={{
              width: "100%",
              padding: "24px",
              textAlign: "center",
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <AlertCircle size={24} color="#DC2626" />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#991B1B" }}>Unable to load trends</div>
            <button
              onClick={fetchTrends}
              className="btn btn-primary"
              style={{
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 700,
                background: "#DC2626",
                borderColor: "#DC2626",
                color: "white",
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          // Fetched Cards
          trends.map((trend, i) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card card-hover"
              style={{
                minWidth: 320,
                padding: "20px",
                flexShrink: 0,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "white",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <span
                    className="badge badge-blue"
                    style={{
                      padding: "3px 9px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "#EFF6FF",
                      color: "#2563EB",
                      border: "1px solid #BFDBFE"
                    }}
                  >
                    AI Suggested
                  </span>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: trend.scores.overall >= 95
                        ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)"
                        : "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      color: trend.scores.overall >= 95 ? "#059669" : "#2563EB",
                      border: `1px solid ${trend.scores.overall >= 95 ? "#BBF7D0" : "#BFDBFE"}`,
                    }}
                  >
                    {trend.scores.overall}
                  </div>
                </div>

                <a href={trend.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 8 }} className="hover-accent">
                    {trend.name}
                  </h3>
                </a>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
                  {trend.description}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    createReelFromIdea(trend.name);
                    router.push("/create");
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  <Wand2 size={12} />
                  Create Content
                </button>
                <button
                  onClick={() => setSelectedTrend(trend)}
                  className="btn btn-secondary"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, padding: "8px 12px", border: "1px solid var(--border-subtle)", background: "#FAFBFC", cursor: "pointer", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  <BarChart2 size={13} />
                  Analyze
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedTrend && (
        <TrendAnalysisModal
          trend={selectedTrend}
          isOpen={!!selectedTrend}
          onClose={() => setSelectedTrend(null)}
        />
      )}
    </div>
  );
}
