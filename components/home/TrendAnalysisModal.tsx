"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Sparkles, Loader2, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trend } from "@/types";

interface TrendAnalysisModalProps {
  trend: Trend | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrendAnalysisModal({ trend, isOpen, onClose }: TrendAnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && trend) {
      setLoading(true);
      fetch("/api/trends/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trendName: trend.name,
          trendCategory: trend.category,
          trendDescription: trend.description
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalysis(data.analysis);
          setChartData(data.chartData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [isOpen, trend]);

  if (!isOpen || !trend) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, 
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(15, 22, 41, 0.6)", backdropFilter: "blur(8px)", padding: 20
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            background: "white", width: "100%", maxWidth: 700,
            borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column", maxHeight: "90vh"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={20} color="#059669" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Trend Deep Dive</h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{trend.name}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ overflowY: "auto", padding: "24px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <Loader2 size={28} className="animate-spin" style={{ marginBottom: 16, color: "var(--accent)" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Generating AI Analysis & Growth Models...</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Chart Section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <BarChart2 size={16} color="var(--text-primary)" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>7-Day Growth Velocity</h3>
                  </div>
                  <div style={{ height: 200, width: "100%", background: "#FAFBFC", borderRadius: 12, border: "1px solid var(--border-subtle)", padding: "16px 16px 0 0" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip 
                          contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                          itemStyle={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}
                          labelStyle={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Insights Section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Sparkles size={16} color="#7C3AED" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>AI Intelligence Brief</h3>
                  </div>
                  <div style={{ 
                    background: "linear-gradient(135deg, #F9FAFB, #F3F4F6)", 
                    padding: 20, borderRadius: 12, border: "1px solid #E5E7EB",
                    fontSize: 13.5, lineHeight: 1.6, color: "var(--text-secondary)"
                  }}>
                    {analysis.split('\n\n').map((paragraph, i) => (
                      <p key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
