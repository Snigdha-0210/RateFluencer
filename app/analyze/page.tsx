"use client";

import { motion } from "framer-motion";
const TRENDS: any[] = [];
const RESEARCH_CARDS: ResearchCard[] = [];
const CONTENT_ANGLES: ContentAngle[] = [];
import { TrendingUp, Wand2, ArrowUp, ArrowDown, Minus, Users, TrendingDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ResearchCard, ContentAngle } from "@/types";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { ScoredInfluencer, InsightsResult } from "@/types/agent";

const ICON_MAP_COLORS: Record<string, string> = {
  MessageSquare: "#FF4500",
  Linkedin: "#0077B5",
  Play: "#FF0000",
  Newspaper: "#6B7280",
  Search: "#4285F4",
  Target: "#2563EB",
  Lightbulb: "#D97706",
  Heart: "#BE185D",
};

function ResearchCardItem({ card }: { card: ResearchCard }) {
  if (!card) return null;
  const trend = card.trend || "stable";
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor = trend === "up" ? "#059669" : trend === "down" ? "#DC2626" : "#6B7280";

  return (
    <div
      className="card"
      style={{
        padding: "16px 18px",
        borderTop: `3px solid ${ICON_MAP_COLORS[card.icon || ""] ?? "#2563EB"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
          {card.title || "Stat"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11.5,
            fontWeight: 700,
            color: trendColor,
          }}
        >
          <TrendIcon size={11} />
          {card.changePercent || 0}%
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 2 }}>
        {card.value || "0"}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{card.subValue || ""}</div>
    </div>
  );
}

function ScoreCalculationBar({ label, score, weight, color }: { label: string; score: number; weight: number; color: string }) {
  const safeScore = score || 0;
  const safeWeight = weight || 0;
  const contribution = ((safeScore * safeWeight) / 100).toFixed(1);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
          <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginLeft: 6 }}>Weight: {safeWeight}%</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color }}>{safeScore}/100</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 6 }}>(+{contribution})</span>
        </div>
      </div>
      <div className="progress-track" style={{ height: 6 }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${safeScore}%` }}
          transition={{ duration: 0.8 }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function AngleCard({ angle, index, trend }: { angle: ContentAngle; index: number; trend: any }) {
  const router = useRouter();
  const createReelFromTrend = useAppStore((state) => state.createReelFromTrend);
  if (!angle) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card card-hover"
      style={{ padding: "20px" }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          border: "1px solid #DBEAFE",
          fontSize: 18,
        }}
      >
        {angle.perspective === "Economic Shift" ? "📊" :
          angle.perspective === "Founder Perspective" ? "🚀" :
          angle.perspective === "Student Perspective" ? "🎓" : "🎬"}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2563EB", marginBottom: 4 }}>
        {angle.perspective || "Perspective"}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 14, fontWeight: 500 }}>
        "{angle.hook || ""}"
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[
          { label: "Reach", value: angle.predictedReach || "0", color: "#2563EB" },
          { label: "Virality", value: `${angle.virality || 0}%`, color: "#D97706" },
          { label: "Fit", value: `${angle.audienceFit || 0}%`, color: "#059669" },
        ].map((m) => (
          <div key={m.label} style={{ padding: "7px 8px", background: "#FAFBFC", borderRadius: 7, border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (trend) {
            createReelFromTrend(trend);
          }
          router.push("/create");
        }}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", fontSize: 12.5, border: "none", cursor: "pointer" }}
      >
        <Wand2 size={12} />
        Generate Content
      </button>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          fontSize: 12.5,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--text-muted)" }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function AudienceDemographics({ audience }: { audience: any }) {
  // Safe gender fallback
  const genders = audience.genders || [
    { name: "Male", percentage: 48 },
    { name: "Female", percentage: 42 },
    { name: "Non-binary", percentage: 5 },
    { name: "Other", percentage: 3 },
    { name: "Prefer Not To Say", percentage: 2 }
  ];

  return (
    <div className="card" style={{ padding: "24px 28px", marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>👥 Who Likes This Topic? — Audience Demographics</h2>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Comprehensive segmentation, regional heatmaps, interest indexing, and gender distribution</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "#EFF6FF", color: "#2563EB", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #BFDBFE" }}>
            Audience Fit: {audience.fitScore || 84}/100
          </div>
          <div style={{ background: "#F0FDF4", color: "#059669", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #BBF7D0" }}>
            Growth Trend: +18.4%
          </div>
          <div style={{ background: "#F5F3FF", color: "#7C3AED", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #DDD6FE" }}>
            Engagement Index: 8.7%
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28, marginBottom: 24 }}>
        {/* Geography & Region */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
            🌍 Top Countries & Regions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {audience.countries?.map((c: any) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  <span>{c.name}</span>
                  <span>{c.percentage}%</span>
                </div>
                <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                  <div className="progress-fill" style={{ width: `${c.percentage}%`, background: "#2563EB", height: "100%" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, borderTop: "1px dashed var(--border-subtle)", paddingTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>REGIONS:</span>
            {audience.regions?.map((r: any) => (
              <span key={r.name} style={{ fontSize: 11, fontWeight: 600, background: "#FAFBFC", border: "1px solid var(--border)", padding: "1px 6px", borderRadius: 4, color: "var(--text-secondary)" }}>
                {r.name} ({r.percentage}%)
              </span>
            ))}
          </div>
        </div>

        {/* Age & Gender Segments */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
            👥 Age & Gender Distribution
          </div>
          
          {/* Gender Breakdown */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8 }}>
            Gender Breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {genders.map((g: any) => (
              <div key={g.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  <span>{g.name}</span>
                  <span>{g.percentage}%</span>
                </div>
                <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                  <div className="progress-fill" style={{ width: `${g.percentage}%`, background: "#7C3AED", height: "100%" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Age Cohorts Graph */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8, borderTop: "1px dashed var(--border-subtle)", paddingTop: 12 }}>
            Age Cohorts
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {audience.ages?.map((a: any) => (
              <div key={a.range}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  <span>{a.range}</span>
                  <span>{a.percentage}%</span>
                </div>
                <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                  <div className="progress-fill" style={{ width: `${a.percentage}%`, background: "#EA580C", height: "100%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupations & Interests */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
            💼 Occupations & Key Interests
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {audience.occupations?.map((o: any) => (
              <div key={o.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  <span>{o.name}</span>
                  <span>{o.percentage}%</span>
                </div>
                <div className="progress-track" style={{ height: 4, background: "#F1F5F9" }}>
                  <div className="progress-fill" style={{ width: `${o.percentage}%`, background: "#059669", height: "100%" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, borderTop: "1px dashed var(--border-subtle)", paddingTop: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>INTERESTS:</span>
            {audience.interests?.map((i: any) => (
              <span key={i.name} style={{ fontSize: 10.5, fontWeight: 600, background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "1px 6px", borderRadius: 4, color: "#047857" }}>
                {i.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Heatmap row */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          🔥 Weekly Engagement Heatmap (Optimal Posting Hotspots)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
            <span>Morning (8-11 AM)</span>
            <span>Afternoon (1-4 PM)</span>
            <span>Evening (6-9 PM)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Morning", values: [92, 85, 78, 88, 95, 60, 45] },
              { label: "Afternoon", values: [40, 55, 62, 50, 48, 72, 80] },
              { label: "Evening", values: [88, 94, 91, 89, 92, 98, 85] }
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", gap: 6 }}>
                {row.values.map((v, idx) => {
                  const bgOpacity = v / 100;
                  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: 24,
                        borderRadius: 4,
                        background: `rgba(37, 99, 235, ${bgOpacity})`,
                        color: v > 60 ? "white" : "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9.5,
                        fontWeight: 700
                      }}
                      title={`${days[idx]} ${row.label}: ${v}% Engagement Level`}
                    >
                      {days[idx]}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrendIntelligencePage() {
  const trend = useAppStore((state) => state.selectedTrend) || (TRENDS && TRENDS.length > 0 ? TRENDS[0] : null);
  const router = useRouter();
  const generateReelWithWorkflow = useAppStore((state) => state.generateReelWithWorkflow);
  const createReelFromTrend = useAppStore((state) => state.createReelFromTrend);

  if (!trend) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>No Trend Selected</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Please select a trend from the Discover or Explore page to analyze.</p>
      </div>
    );
  }

  // Defensive values
  const scores = trend.scores || {
    overall: 0,
    virality: 0,
    growth: 0,
    searchInterest: 0,
    engagementPotential: 0,
    novelty: 0,
    audienceRelevance: 0,
    estimatedReach: "0"
  };

  const chartData = Array.isArray(trend.chartData) ? trend.chartData : [];

  const audience = trend.audience || {
    countries: [{ name: "United States", percentage: 40 }, { name: "India", percentage: 35 }, { name: "United Kingdom", percentage: 15 }, { name: "Canada", percentage: 10 }],
    regions: [{ name: "North America", percentage: 50 }, { name: "Asia-Pacific", percentage: 35 }, { name: "Europe", percentage: 15 }],
    ages: [{ range: "18-24 (Gen Z)", percentage: 45 }, { range: "25-34 (Millennials)", percentage: 40 }, { range: "35-44 (Gen X)", percentage: 10 }, { range: "45+ (Boomers)", percentage: 5 }],
    genders: [{ name: "Male", percentage: 50 }, { name: "Female", percentage: 45 }, { name: "Non-binary", percentage: 5 }],
    interests: [{ name: "Tech & Coding", percentage: 40 }, { name: "Startups & Growth", percentage: 40 }, { name: "Personal Development", percentage: 20 }],
    occupations: [{ name: "Founders & Creators", percentage: 40 }, { name: "Software Engineers", percentage: 30 }, { name: "Students & Designers", percentage: 30 }],
    fitScore: 84
  };

  return (
    <>
      {/* Trend Header */}
      <div className="page-header">
        <div
          style={{
            padding: "24px 28px",
            background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
            borderRadius: 16,
            border: "1px solid #DBEAFE",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#2563EB", marginBottom: 8 }}>
                🔥 Analyze — Why It Matters
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F1629", letterSpacing: "-0.5px", lineHeight: 1.3, maxWidth: 600, marginBottom: 16 }}>
                {trend.name || "Trend Analysis"}
              </h1>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Trend Score", value: `${scores.overall}/100`, bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
                  { label: "Virality", value: `${scores.virality}/100`, bg: "#FFF7ED", color: "#D97706", border: "#FED7AA" },
                  { label: "Growth", value: `+${scores.growth}%`, bg: "#F0FDF4", color: "#059669", border: "#BBF7D0" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "10px 18px",
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: s.color, marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                generateReelWithWorkflow(trend.name, "trend", trend.category, trend, router);
              }}
              className="btn btn-primary"
              style={{ textDecoration: "none", padding: "12px 24px", fontSize: 14, border: "none", cursor: "pointer" }}
            >
              <Wand2 size={15} />
              Create Content
            </button>
          </div>
        </div>
      </div>

      {/* Research Cards */}
      <h2 className="section-heading">Research Intelligence</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {(RESEARCH_CARDS || []).map((card) => {
          if (!card) return null;
          const updatedCard = card.id === "r3" ? { ...card, title: "YouTube Momentum" } : card;
          return <ResearchCardItem key={updatedCard.id} card={updatedCard} />;
        })}
      </div>

      {/* 30-Day Chart & Score Calculation */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* 30-Day Chart */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>30-Day Trend Analysis</h2>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Search interest, engagement, and reach over time</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["7D", "14D", "30D"].map((t, i) => (
                <button
                  key={t}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    border: "1px solid var(--border)",
                    background: i === 2 ? "#EFF6FF" : "transparent",
                    color: i === 2 ? "#2563EB" : "var(--text-secondary)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            {chartData.length > 0 ? (
              <AreaChart data={chartData.slice(-30)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8896A9" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#8896A9" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Area type="monotone" dataKey="value" name="Interest Score" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradValue)" dot={false} />
                <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#7C3AED" strokeWidth={2} fill="url(#gradEngagement)" dot={false} />
              </AreaChart>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                No Chart Data Available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Trend Score Calculation */}
        <div className="card" style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Trend Score Calculation</h2>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Weighted algorithms behind the overall rating ({scores.overall}/100)</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ScoreCalculationBar label="Growth Velocity" score={94} weight={25} color="#059669" />
            <ScoreCalculationBar label="Search Interest" score={scores.searchInterest} weight={20} color="#2563EB" />
            <ScoreCalculationBar label="Engagement Potential" score={scores.engagementPotential} weight={20} color="#7C3AED" />
            <ScoreCalculationBar label="Novelty" score={scores.novelty} weight={15} color="#0891B2" />
            <ScoreCalculationBar label="Audience Relevance" score={scores.audienceRelevance} weight={20} color="#BE185D" />
          </div>

          <div style={{ marginTop: 14, padding: "10px 12px", background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)", borderRadius: 10, border: "1px solid #BFDBFE" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1D4ED8" }}>OVERALL SCORE CONTRIBUTION</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: "#1D4ED8" }}>{scores.overall}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Demographics */}
      <AudienceDemographics audience={audience} />

      {/* Content Angles */}
      <h2 className="section-heading">Content Angles</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {(CONTENT_ANGLES || []).map((angle, i) => (
          <AngleCard key={angle ? angle.id : i} angle={angle} index={i} trend={trend} />
        ))}
      </div>

      {/* AI Insight Engine */}
      <AIInsightsPanel />

      {/* Influencer Intelligence */}
      <InfluencerIntelligence />
    </>
  );
}

// ─── AI Insights Panel ───────────────────────────────────────────────────────

function AIInsightsPanel() {
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights?limit=5")
      .then((r) => r.json())
      .then((data) => { setInsights(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Wand2 size={18} color="#7C3AED" />
        <h2 className="section-heading" style={{ margin: 0 }}>AI Insight Engine</h2>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", padding: "2px 8px", borderRadius: 99 }}>Learning Memory</span>
        {insights && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
            {insights.systemStats.totalReelsGenerated} reels analysed · avg virality {insights.systemStats.avgViralityScore}/100
          </span>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
        Patterns extracted from high-performing reels. Continuously updated as the agent generates new content.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>Loading insights…</div>
      ) : insights ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Audience Insights */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#7C3AED", marginBottom: 12 }}>🧠 Audience & Content Insights</div>
            {insights.audienceInsights.slice(0, 6).map((insight, i) => (
              <div key={i} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "7px 0",
                borderBottom: i < 5 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <span style={{ color: "#7C3AED", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{insight}</span>
              </div>
            ))}
          </div>

          {/* Top Hook Patterns */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#059669", marginBottom: 12 }}>🪝 Top Hook Patterns</div>
            {insights.topHooks.length === 0 ? (
              <>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 10 }}>
                  Generate your first reel to start tracking hook patterns.
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>PROVEN PATTERNS TO START WITH:</div>
                {["nobody talks about…", "pov: you just discovered…", "stop doing this if…", "how i made $X in 30 days"].map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#2563EB", marginBottom: 4 }}>✓ "{p}"</div>
                ))}
              </>
            ) : (
              insights.topHooks.map((hook, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>"{hook.pattern}…"</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>{hook.avgScore}/100</span>
                  </div>
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 99 }}>
                    <div style={{ height: 4, width: `${hook.avgScore}%`, background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>Used {hook.count}× · avg score {hook.avgScore}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#DC2626" }}>Failed to load insights.</div>
      )}
    </div>
  );
}

// ─── Influencer Intelligence Component ───────────────────────────────────────

const GROWTH_COLORS: Record<string, string> = {
  explosive: "#DC2626",
  high: "#D97706",
  moderate: "#2563EB",
  stable: "#6B7280",
};

const RISK_CONFIG = {
  HIGH:   { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
  MEDIUM: { bg: "#FFF7ED", border: "#FED7AA", color: "#D97706" },
  LOW:    { bg: "#F0FDF4", border: "#BBF7D0", color: "#059669" },
};

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: "#E5E7EB", borderRadius: 99 }}>
        <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function InfluencerCard({ inf, index }: { inf: ScoredInfluencer; index: number }) {
  const riskCfg = RISK_CONFIG[inf.riskLevel ?? "MEDIUM"];
  const scoreColor = inf.aiScore >= 80 ? "#059669" : inf.aiScore >= 60 ? "#D97706" : "#DC2626";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card"
      style={{ padding: "18px 20px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: inf.rank === 1 ? "linear-gradient(135deg, #FEF3C7, #FDE68A)" : "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
            border: `1px solid ${inf.rank === 1 ? "#FCD34D" : "#BFDBFE"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: inf.rank === 1 ? 16 : 13, fontWeight: 800,
            color: inf.rank === 1 ? "#D97706" : "#2563EB", flexShrink: 0,
          }}>
            {inf.rank === 1 ? "🏆" : `#${inf.rank}`}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{inf.name}</div>
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>{inf.handle}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{inf.aiScore}</div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>AI Score</div>
        </div>
      </div>

      {/* Growth + category */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
          background: inf.growthTrend === "explosive" ? "#FEF2F2" : inf.growthTrend === "high" ? "#FFF7ED" : "#F0FDF4",
          color: GROWTH_COLORS[inf.growthTrend],
          border: `1px solid ${inf.growthTrend === "explosive" ? "#FECACA" : inf.growthTrend === "high" ? "#FED7AA" : "#BBF7D0"}`,
        }}>
          {inf.growthTrend === "explosive" ? "🔥 Explosive" : inf.growthTrend === "high" ? "⚡ High" : "📈 Moderate"}
        </span>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{inf.category}</span>
      </div>

      {/* Score breakdown bars */}
      {inf.scoreBreakdown && (
        <div style={{ marginBottom: 10 }}>
          <ScoreBar label="Reach" value={inf.scoreBreakdown.reachScore} max={30} color="#2563EB" />
          <ScoreBar label="Engagement" value={inf.scoreBreakdown.engagementScore} max={25} color="#7C3AED" />
          <ScoreBar label="Authenticity" value={inf.scoreBreakdown.authenticityScore} max={25} color="#059669" />
          <ScoreBar label="Growth" value={inf.scoreBreakdown.growthScore} max={20} color="#D97706" />
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        {[
          { label: "Followers", value: inf.followers },
          { label: "Avg Views", value: inf.avgViews },
          { label: "Engagement", value: `${inf.engagementRate}%` },
        ].map((s) => (
          <div key={s.label} style={{ padding: "5px 8px", background: "#FAFBFC", borderRadius: 6, border: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Risk level */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: riskCfg.bg, borderRadius: 7, border: `1px solid ${riskCfg.border}`, marginBottom: 8 }}>
        <AlertTriangle size={10} color={riskCfg.color} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: riskCfg.color }}>
          {inf.riskLevel} RISK · {inf.fakeEngagementScore}% fake engagement
        </span>
      </div>

      {/* AI Reason */}
      {inf.reason && (
        <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.55, fontStyle: "italic", borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}>
          💡 {inf.reason}
        </div>
      )}
    </motion.div>
  );
}

function InfluencerIntelligence() {
  const [influencers, setInfluencers] = useState<ScoredInfluencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/influencers")
      .then((r) => r.json())
      .then((data) => { setInfluencers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Users size={18} color="#7C3AED" />
        <h2 className="section-heading" style={{ margin: 0 }}>Influencer Intelligence</h2>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", padding: "2px 8px", borderRadius: 99 }}>AI-Ranked</span>
        {influencers.length > 0 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
            {influencers.length} creators ranked by composite AI score
          </span>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 18 }}>
        Reach, engagement, authenticity & growth velocity — scored and ranked by the AI scoring engine.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>Scoring influencers…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {influencers.map((inf, i) => (
            <InfluencerCard key={inf.id} inf={inf} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}


