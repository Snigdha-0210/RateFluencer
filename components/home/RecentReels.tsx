"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reel } from "@/types";
import { useRouter } from "next/navigation";

export default function RecentReels() {
  const [recent, setRecent] = useState<any[]>([]);
  const setActiveReelId = useAppStore((state) => state.setActiveReelId);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/reels/recent")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reels)) {
          setRecent(data.reels);
        }
      })
      .catch(console.error);
  }, []);

  const handleOpen = (id: string) => {
    setActiveReelId(id);
    setActivePage("create");
    router.push("/create");
  };

  const getStatusColor = (status: Reel["status"]) => {
    switch (status) {
      case "published": return { bg: "#F0FDF4", text: "#059669", border: "#BBF7D0" };
      case "generated": return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
      default: return { bg: "#FFF7ED", text: "#D97706", border: "#FED7AA" };
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Recently Created Reels
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Continue editing or manage your active production pipeline
          </p>
        </div>
        <button
          onClick={() => {
            setActivePage("my-reels");
            router.push("/my-reels");
          }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          View all library <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {recent.map((reel, i) => {
          const statusColors = getStatusColor(reel.status);
          return (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleOpen(reel.id)}
              className="card card-hover"
              style={{ padding: "18px 20px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                {/* Header info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, width: "100%" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 99,
                        background: reel.sourceType === "trend" ? "#F5F3FF" : "#EFF6FF",
                        color: reel.sourceType === "trend" ? "#7C3AED" : "#2563EB",
                        border: `1px solid ${reel.sourceType === "trend" ? "#DDD6FE" : "#BFDBFE"}`
                      }}
                    >
                      {reel.sourceType === "trend" ? "🔥 Trend" : "💡 Idea"}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 99,
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`
                      }}
                    >
                      {reel.status}
                    </span>
                  </div>

                  {/* Virality score badge */}
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#2563EB",
                      background: "#EFF6FF",
                      padding: "2px 6px",
                      borderRadius: 6,
                      border: "1px solid #BFDBFE"
                    }}
                  >
                    Score: {reel.viralityScore}
                  </div>
                </div>

                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 12 }}>
                  {reel.title}
                </h3>
              </div>

              {/* Footer row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 10, marginTop: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                  <Calendar size={12} />
                  {reel.createdAt}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent)", display: "flex", alignItems: "center", gap: 2 }}>
                  Open Studio →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
