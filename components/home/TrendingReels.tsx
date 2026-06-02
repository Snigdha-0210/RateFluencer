"use client";

import { motion } from "framer-motion";
import { Eye, Heart, Share2, Bookmark, Flame, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export default function TrendingReels() {
  const [reels, setReels] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reels/trending")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reels)) {
          setReels(data.reels);
        }
      })
      .catch(console.error);
  }, []);

  if (reels.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #FFF7ED, #FFF1F2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #FFE4E6"
          }}
        >
          <Flame size={16} color="#E11D48" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Trending Reels Today
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Real-time viral content formats mapped across global creative categories
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
        {reels.map((reel, i) => (
          <motion.div
            key={reel.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card card-hover"
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "#FAFBFC",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  {reel.sourceType === "trend" ? "Trend" : "Idea"}
                </span>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#DC2626",
                    background: "#FEF2F2",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: "1px solid #FECACA"
                  }}
                >
                  Score: {reel.viralityScore}
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 16 }}>
                {reel.title}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Views", value: "10K-50K", icon: Eye, color: "#2563EB" },
                  { label: "Likes", value: "1K-5K", icon: Heart, color: "#DC2626" },
                  { label: "Shares", value: "100-500", icon: Share2, color: "#7C3AED" },
                  { label: "Comments", value: "200-800", icon: Bookmark, color: "#059669" }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "6px 10px",
                      background: "#FAFBFC",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <stat.icon size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
