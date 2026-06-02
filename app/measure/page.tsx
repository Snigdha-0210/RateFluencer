"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContentEvent } from "@/types/events";
import { ArrowUp, ArrowDown, TrendingUp, Hash, Bookmark, Cpu, BookOpen, MessageCircle, Clock, Zap, Target, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: 12.5 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-muted)" }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{typeof p.value === "number" && p.value > 1000 ? `${(p.value / 1000).toFixed(0)}K` : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ViralityBadge({ score }: { score: number }) {
  const cls = score >= 90 ? "badge-green" : score >= 80 ? "badge-blue" : score >= 70 ? "badge-orange" : "badge-red";
  return <span className={`badge ${cls}`}>{score}</span>;
}

const ENHANCED_AI_INSIGHTS = [
  {
    id: "i1",
    insight: "Hooks with numbers perform 22% better than text-only hooks",
    detail: "Data shows statistical significance in CTR when listing explicit costs or growth percentages in the first 3 seconds.",
    lift: "+22% CTR",
    category: "Hook Strategy",
    icon: Hash,
    color: "#2563EB"
  },
  {
    id: "i2",
    insight: "Founder-focused content generates 41% more saves than general content",
    detail: "First-person storytelling of startup challenges builds higher audience connection and bookmarking utility.",
    lift: "+41% Saves",
    category: "Content Type",
    icon: Bookmark,
    color: "#7C3AED"
  },
  {
    id: "i3",
    insight: "AI topics outperform general startup content by 2.8x in reach",
    detail: "High algorithmic velocity is pushing AI-related tags to broader target explorer nodes.",
    lift: "2.8x Reach",
    category: "Topic Selection",
    icon: Cpu,
    color: "#059669"
  },
  {
    id: "i4",
    insight: "Storytelling reels outperform tutorials by 28%",
    detail: "First-person anecdotes and high-leverage business storytelling capture longer initial retention than step-by-step tutorial sequences.",
    lift: "+28% Watch",
    category: "Format Strategy",
    icon: BookOpen,
    color: "#D97706"
  }
];

const RECOMMENDATION_INSIGHTS = [
  {
    id: "r1",
    recommendation: "Post between 8:00 AM – 10:00 AM EST",
    action: "Schedule content during the morning commute window to maximize initial engagement velocity across platforms.",
    metric: "Optimal Window",
    icon: Clock,
    color: "#059669"
  },
  {
    id: "r2",
    recommendation: "Use shorter hooks (under 10 words)",
    action: "Decrease hook complexity in video templates. Keep text overlay clean to avoid screen clutter.",
    metric: "Format Rule",
    icon: Hash,
    color: "#D97706"
  },
  {
    id: "r3",
    recommendation: "Focus on AI Agent topics this week",
    action: "High sentiment indicators and search index scores point to 'Autonomous workflows' as key growth topics.",
    metric: "Priority Topic",
    icon: Cpu,
    color: "#2563EB"
  }
];

export default function AnalyticsPage() {
  const [events, setEvents] = useState<ContentEvent[]>([]);
  const [learningState, setLearningState] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data.filter(d => d.type === "CONTENT_GENERATED") as ContentEvent[]);
        }
      })
      .catch(console.error);
      
    fetch("/api/learning/state")
      .then(res => res.json())
      .then(data => setLearningState(data))
      .catch(console.error);
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/learning/simulate", { method: "POST" });
      const data = await res.json();
      if (!data.error) {
        setLearningState(data);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSimulating(false);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Measure</h1>
        <p className="page-subtitle">Performance overview for the last 30 days</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <motion.div className="card stat-card">
          <div className="stat-label">Total Reels</div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-change up"><ArrowUp size={11} /> Real Data</div>
        </motion.div>
        <motion.div className="card stat-card">
          <div className="stat-label">Avg Virality Score</div>
          <div className="stat-value">
            {events.length > 0 ? Math.round(events.reduce((a, b) => a + (b.viralityScore || b.predictedScore || 0), 0) / events.length) : 0}
          </div>
          <div className="stat-change up"><ArrowUp size={11} /> Real Data</div>
        </motion.div>
      </div>

      {/* AI Performance Intelligence */}
      <div className="card" style={{ marginBottom: 28, padding: "24px 28px", background: "linear-gradient(to right, #0F1629, #1E293B)", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ padding: "4px 8px", background: "rgba(37, 99, 235, 0.2)", borderRadius: 6, color: "#60A5FA", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Phase 6 Adaptive AI
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Real-Time Intelligence Calibration</h2>
            <p style={{ fontSize: 13.5, color: "#94A3B8", marginTop: 4 }}>
              The AI is continuously tuning its internal scoring weights by comparing predictions against real-world performance.
            </p>
          </div>
          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", 
              background: "#2563EB", color: "white", border: "none", borderRadius: 10, 
              fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: isSimulating ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={isSimulating ? "spin-animation" : ""} />
            {isSimulating ? "Simulating..." : "Simulate Live Analytics Data"}
          </button>
        </div>

        {learningState ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 20 }}>
            {/* Accuracy */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
                <Target size={14} /> Prediction Accuracy
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>
                {learningState.predictionAccuracy.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowUp size={12} /> Model Improving
              </div>
            </div>

            {/* Adjustments */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
                <Zap size={14} /> Weight Calibrations
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 4 }}>
                {learningState.adjustmentsMade}
              </div>
              <div style={{ fontSize: 12, color: "#60A5FA" }}>
                Total adjustments made
              </div>
            </div>

            {/* Active Weights */}
            <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: 20, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>
                <Cpu size={14} /> Current Model Weights
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                {[
                  { key: "hookWeight", label: "Hook Strength", val: learningState.weights.hookWeight },
                  { key: "emotionWeight", label: "Emotional Resonance", val: learningState.weights.emotionWeight },
                  { key: "noveltyWeight", label: "Topic Novelty", val: learningState.weights.noveltyWeight },
                  { key: "audienceWeight", label: "Audience Fit", val: learningState.weights.audienceWeight },
                  { key: "shareWeight", label: "Shareability Trigger", val: learningState.weights.shareWeight },
                ].map((w, idx) => {
                  const prevVal = learningState.previousWeights ? learningState.previousWeights[w.key] : null;
                  const changed = prevVal !== null && prevVal !== w.val;
                  const trendColor = changed ? (w.val > prevVal ? "#10B981" : "#EF4444") : "white";
                  
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, background: changed ? "rgba(255,255,255,0.03)" : "transparent", padding: "4px 8px", borderRadius: 6, margin: "0 -8px" }}>
                      <span style={{ color: "#94A3B8" }}>{w.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {changed && (
                          <>
                            <span style={{ color: "#64748B", textDecoration: "line-through" }}>{(prevVal * 100).toFixed(0)}%</span>
                            <span style={{ color: "#64748B" }}>→</span>
                          </>
                        )}
                        <span style={{ fontWeight: 700, color: trendColor }}>{(w.val * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#94A3B8", fontSize: 14 }}>Loading AI Intelligence state...</div>
        )}

        {/* Explainable AI Reasoning Box */}
        {learningState?.weightChangeReason && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, padding: 16, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
              <Zap size={14} /> Intelligence Calibration Reasoning
            </div>
            <div style={{ fontSize: 14, color: "#D1D5DB", lineHeight: 1.5 }}>
              {learningState.weightChangeReason}
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Reach Trend */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>Reach Trend</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Total audience reached per day</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: "#8896A9" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10.5, fill: "#8896A9" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="Reach" stroke="#2563EB" strokeWidth={2.5} fill="url(#reachGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Virality & Engagement */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>Virality & Engagement</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Score + engagement rate</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10.5, fill: "#8896A9" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10.5, fill: "#8896A9" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="virality" name="Virality" stroke="#D97706" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="engagement" name="Engagement %" stroke="#7C3AED" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Content */}
      <div className="card" style={{ overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>Recent Content</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Your published reels performance</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Trend</th>
              <th>Virality</th>
              <th>Reach</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)", maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.topic}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{item.category}</span>
                </td>
                <td>
                  <ViralityBadge score={item.viralityScore || item.predictedScore} />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 700, color: "#2563EB" }}>
                    <TrendingUp size={11} />
                    {item.actualViews || item.expectedViewsLabel}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audience Intelligence Section */}
      <h2 className="section-heading" style={{ marginTop: 28, marginBottom: 14 }}>Audience Intelligence</h2>
      <div className="card" style={{ padding: "24px 28px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Global Audience Segments</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Demographic insights and occupation distribution across all published channels</p>
          </div>
          <div style={{ background: "#EFF6FF", color: "#2563EB", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #BFDBFE" }}>
            Total Reach: 1.4M
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {/* Countries */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
              🌍 Top Countries & Geography
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "United States", percentage: 48, color: "#2563EB" },
                { name: "India", percentage: 26, color: "#2563EB" },
                { name: "United Kingdom", percentage: 14, color: "#2563EB" },
                { name: "Canada", percentage: 12, color: "#2563EB" },
              ].map((c) => (
                <div key={c.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    <span>{c.name}</span>
                    <span>{c.percentage}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                    <div className="progress-fill" style={{ width: `${c.percentage}%`, background: c.color, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Segments */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
              👥 Age & Generation Segments
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { range: "18-24 (Gen Z)", percentage: 52, color: "#7C3AED" },
                { range: "25-34 (Millennials)", percentage: 38, color: "#7C3AED" },
                { range: "35-44 (Gen X)", percentage: 8, color: "#7C3AED" },
                { range: "45+ (Boomers)", percentage: 2, color: "#7C3AED" },
              ].map((a) => (
                <div key={a.range}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    <span>{a.range}</span>
                    <span>{a.percentage}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                    <div className="progress-fill" style={{ width: `${a.percentage}%`, background: a.color, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupations */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
              💼 Professional Occupations
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Creators & Influencers", percentage: 42, color: "#059669" },
                { name: "Software Engineers", percentage: 28, color: "#059669" },
                { name: "Founders & Builders", percentage: 18, color: "#059669" },
                { name: "Students & Academic", percentage: 12, color: "#059669" },
              ].map((o) => (
                <div key={o.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    <span>{o.name}</span>
                    <span>{o.percentage}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                    <div className="progress-fill" style={{ width: `${o.percentage}%`, background: o.color, height: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* AI Learning Insights */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>AI Learning Insights</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Patterns extracted from your best performing content</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENHANCED_AI_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: "12px 14px",
                    background: "#FAFBFC",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                      border: "1px solid #BFDBFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 700, marginBottom: 2 }}>
                      {insight.insight}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: 6 }}>
                      {insight.detail}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{insight.category}</span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: "#059669",
                          background: "#F0FDF4",
                          padding: "2px 8px",
                          borderRadius: 99,
                          border: "1px solid #BBF7D0",
                        }}
                      >
                        {insight.lift}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recommendation Engine Insights */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>Recommendation Engine Insights</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Actionable tasks to maximize future reach</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RECOMMENDATION_INSIGHTS.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    padding: "12px 14px",
                    background: "#FAFBFC",
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)",
                      border: "1px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color="#059669" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 700, marginBottom: 2 }}>
                      {rec.recommendation}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: 6 }}>
                      {rec.action}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Recommendation</span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          color: "#2563EB",
                          background: "#EFF6FF",
                          padding: "2px 8px",
                          borderRadius: 99,
                          border: "1px solid #BFDBFE",
                        }}
                      >
                        {rec.metric}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
