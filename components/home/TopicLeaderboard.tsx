"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendEvent } from "@/types/events";
import { TrendingUp, Flame } from "lucide-react";
import { getCategoryColor } from "@/lib/utils";

function LeaderboardItem({ rank, trend, metric, value, color }: {
  rank: number;
  trend: TrendEvent;
  metric: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.07 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: rank < 4 ? "1px solid var(--border-subtle)" : "none",
      }}
    >
      {/* Rank */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
          background: rank === 1 ? "linear-gradient(135deg, #FEF3C7, #FDE68A)" :
            rank === 2 ? "#F3F4F6" : "#FAFBFC",
          color: rank === 1 ? "#D97706" : rank === 2 ? "#6B7280" : "#9CA3AF",
          border: rank === 1 ? "1px solid #FCD34D" : "1px solid var(--border-subtle)",
        }}
      >
        {rank}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={(trend as any).url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.2s" }} className="hover-accent">
            {trend.title || trend.topic}
          </div>
        </a>
        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{trend.source}</div>
      </div>

      {/* Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 60 }}>
          <div className="score-bar-bg">
            <motion.div
              className="score-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(Number(value) / 100) * 100}%` }}
              transition={{ delay: rank * 0.07 + 0.3, duration: 0.6 }}
              style={{ background: color }}
            />
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color, minWidth: 42, textAlign: "right" }}>{value}</span>
      </div>
    </motion.div>
  );
}

export default function TopicLeaderboard() {
  const [trends, setTrends] = useState<TrendEvent[]>([]);

  useEffect(() => {
    fetch("/api/trends/firestore")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.trends)) {
          // Map real DB fields to the expected component format
          const mapped = data.trends.map((t: any) => ({
            id: t.id,
            title: t.name,
            topic: t.category,
            source: t.sources?.[0] || 'Internet',
            momentum: t.scores?.virality || 0,
            volume: t.scores?.growth || 0,
            url: t.url || "#"
          }));
          setTrends(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const byVirality = [...trends].sort((a, b) => b.momentum - a.momentum).slice(0, 5);
  const byGrowth = [...trends].sort((a, b) => b.volume - a.volume).slice(0, 5);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Most Viral */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={15} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Most Viral Topics</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ranked by virality score</div>
          </div>
        </div>
        {byVirality.map((trend, i) => (
          <LeaderboardItem
            key={trend.id}
            rank={i + 1}
            trend={trend}
            metric="virality"
            value={trend.momentum}
            color="#D97706"
          />
        ))}
      </div>

      {/* Highest Growth */}
      <div className="card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={15} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Highest Growth Topics</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ranked by growth velocity</div>
          </div>
        </div>
        {byGrowth.map((trend, i) => (
          <LeaderboardItem
            key={trend.id}
            rank={i + 1}
            trend={trend}
            metric="growth"
            value={trend.volume}
            color="#059669"
          />
        ))}
      </div>
    </div>
  );
}
