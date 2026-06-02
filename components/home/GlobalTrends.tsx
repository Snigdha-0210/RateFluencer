"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, BarChart2, Loader2, ExternalLink, MapPin } from "lucide-react";
import { Trend } from "@/types";
import TrendAnalysisModal from "./TrendAnalysisModal";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
];

export default function GlobalTrends() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trends/country`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.trends) {
          setTrends(data.trends.slice(0, 20));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Globe size={18} color="#2563EB" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Global Top Trends</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>The biggest stories right now, across the entire globe.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 size={24} className="animate-spin" color="var(--accent)" />
        </div>
      ) : trends.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          No global trends found. Please wait for the next data sync.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {trends.map((trend, i) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr auto auto",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: "#FAFBFC",
                borderRadius: 12,
                border: "1px solid var(--border-subtle)"
              }}
            >
              {/* Rank */}
              <div style={{ fontSize: 14, fontWeight: 800, color: i < 3 ? "#D97706" : "var(--text-muted)", textAlign: "center" }}>
                #{i + 1}
              </div>

              {/* Title & Category */}
              <div style={{ minWidth: 0 }}>
                <a href={trend.url || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="hover-accent">
                    {trend.name}
                  </div>
                  <ExternalLink size={12} color="#9CA3AF" />
                </a>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ 
                    padding: "2px 8px", 
                    background: "white", 
                    borderRadius: 99, 
                    border: "1px solid var(--border)", 
                    fontSize: 10, 
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase"
                  }}>
                    {trend.category}
                  </span>
                  • Score: {trend.scores.overall}
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={() => setSelectedTrend(trend)}
                className="btn btn-primary"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  gap: 6,
                }}
              >
                <BarChart2 size={13} />
                Analyze
              </button>
            </motion.div>
          ))}
        </div>
      )}

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
