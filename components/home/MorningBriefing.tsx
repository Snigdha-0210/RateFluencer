"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Flame, TrendingUp, Zap, Bot, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import TrendCard from "@/components/explore/TrendCard";
import { Trend } from "@/types";

function NetflixRow({ title, subtitle, trends }: { title: string; subtitle?: string; trends: Trend[] }) {
  if (!trends || trends.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0F1629", letterSpacing: "-0.4px" }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div
        style={{
          display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, paddingTop: 4, paddingLeft: 4, paddingRight: 4, margin: "0 -4px"
        }}
        className="netflix-scroll"
      >
        {trends.map((trend, i) => (
          <div key={trend.id} style={{ minWidth: 320, maxWidth: 320, flexShrink: 0 }}>
            <TrendCard trend={trend} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  Users, Flame, TrendingUp, Zap,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  blue:   { bg: "#EFF6FF", icon: "#2563EB", border: "#BFDBFE" },
  orange: { bg: "#FFF7ED", icon: "#D97706", border: "#FED7AA" },
  green:  { bg: "#F0FDF4", icon: "#059669", border: "#BBF7D0" },
  purple: { bg: "#F5F3FF", icon: "#7C3AED", border: "#DDD6FE" },
};

const STATS = [
  {
    label: "Potential Reach",
    value: "18.4M",
    description: "Estimated audience size across today's opportunities.",
    tooltip: "Calculated by aggregating the unique monthly active users across scanned platforms where these topics are trending.",
    icon: "Users",
    color: "blue",
  },
  {
    label: "Average Opportunity Score",
    value: "84/100",
    description: "Based on: Growth Velocity, Search Interest, Engagement Potential, Novelty, Audience Relevance",
    tooltip: "Weighted average score evaluating: Growth Velocity (25%), Search Interest (20%), Engagement Potential (20%), Novelty (15%), and Audience Relevance (20%).",
    icon: "Flame",
    color: "orange",
  },
  {
    label: "Topics Monitored",
    value: "142",
    description: "Topics currently tracked by the AI system.",
    tooltip: "The number of active content topics currently being indexed, filtered, and analyzed by CreatorOS across social feeds.",
    icon: "TrendingUp",
    color: "green",
  },
  {
    label: "Emerging Trends",
    value: "37",
    description: "Topics showing significant growth today.",
    tooltip: "Trends that have experienced a growth velocity greater than 50% in the last 24 hours.",
    icon: "Zap",
    color: "purple",
  },
];

export default function MorningBriefing() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const router = useRouter();
  const isAutonomousRunning = useAppStore(state => state.isAutonomousRunning);
  const autonomousLog = useAppStore(state => state.autonomousLog);
  const runAutonomousAgent = useAppStore(state => state.runAutonomousAgent);
  const autonomousResult = useAppStore(state => state.autonomousResult);
  const postAutonomousResult = useAppStore(state => state.postAutonomousResult);

  const handleRunAgent = () => {
    runAutonomousAgent(router);
  };

  const handlePostResult = () => {
    postAutonomousResult(router);
  };

  return (
    <>
      <AnimatePresence>
        {isAutonomousRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(15, 22, 41, 0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: 24,
                padding: 40,
                width: 480,
                maxWidth: "90%",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                textAlign: "center"
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                border: "2px solid #BFDBFE"
              }}>
                <Bot size={32} color="#2563EB" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F1629", marginBottom: 8 }}>
                AI Agent Running
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>
                The autonomous engine is currently researching, drafting, and optimizing.
              </p>
              
              <div style={{ textAlign: "left", background: "#F8FAFC", borderRadius: 12, padding: 20 }}>
                {autonomousLog.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ 
                      display: "flex", alignItems: "flex-start", gap: 12, 
                      marginBottom: index === autonomousLog.length - 1 ? 0 : 12,
                      opacity: index === autonomousLog.length - 1 ? 1 : 0.5
                    }}
                  >
                    {index === autonomousLog.length - 1 ? (
                      <Loader2 size={16} color="#2563EB" className="spin-animation" style={{ marginTop: 2 }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <Zap size={10} color="white" />
                      </div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#334155", lineHeight: 1.4 }}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {autonomousResult && !isAutonomousRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(15, 22, 41, 0.9)",
              backdropFilter: "blur(12px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              overflowY: "auto"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              style={{
                background: "white",
                borderRadius: 24,
                width: "100%",
                maxWidth: 800,
                maxHeight: "90vh",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "24px 40px", background: "linear-gradient(to right, #0F1629, #1E293B)", color: "white", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Autonomous Strategy Finalized</h2>
                    <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Review the AI-generated content package before publishing.</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", flex: 1 }}>
                {/* AI Reasoning Section */}
                <div style={{ padding: 20, background: "#F0FDF4", borderRadius: 12, border: "1px solid #BBF7D0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 8 }}>
                    <CheckCircle2 size={16} /> Why This Will Go Viral
                  </div>
                  <p style={{ fontSize: 14, color: "#064E3B", lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                    {autonomousResult.aiReasoningSummary}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Predicted Performance */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F1629", margin: 0 }}>Predicted Performance</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1, background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Virality Score</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#2563EB" }}>{autonomousResult.reel.viralityScore}/100</div>
                      </div>
                      <div style={{ flex: 1, background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Expected Views</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#0F1629" }}>{autonomousResult.reel.draft.expectedViews}</div>
                      </div>
                    </div>
                  </div>

                  {/* Topic & Angle */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F1629", margin: 0 }}>Selected Topic</h3>
                    <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", height: "100%" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1629", marginBottom: 8 }}>{autonomousResult.reel.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B", display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ padding: "2px 8px", background: "#EFF6FF", color: "#2563EB", borderRadius: 4, fontWeight: 600 }}>{autonomousResult.reel.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F1629", marginBottom: 12 }}>Content Preview</h3>
                  <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>The Hook</div>
                    <p style={{ fontSize: 14, color: "#0F1629", fontWeight: 600, lineHeight: 1.5, margin: "0 0 16px 0" }}>
                      "{autonomousResult.reel.draft.hook}"
                    </p>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 8 }}>The Story</div>
                    <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.6, margin: 0 }}>
                      {autonomousResult.reel.draft.story}
                    </p>
                  </div>
                </div>

                {/* Dashboard Trends */}
                {autonomousResult.dashboardTrends && (
                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F1629", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={20} color="#2563EB" /> 
                      Discovered Trends Dashboard
                    </h3>
                    
                    <NetflixRow 
                      title="Recommended For You" 
                      subtitle="Top opportunities (Score 85+) based on your profile"
                      trends={autonomousResult.dashboardTrends.recommended} 
                    />
                    <NetflixRow 
                      title="Most Viral Potential" 
                      subtitle="Highest virality predictions across platforms"
                      trends={autonomousResult.dashboardTrends.mostViral} 
                    />
                    <NetflixRow 
                      title="Highest Growth Velocity" 
                      subtitle="Trends with the fastest acceleration in the last 24h"
                      trends={autonomousResult.dashboardTrends.highestGrowth} 
                    />
                    <NetflixRow 
                      title="Newest Trends" 
                      subtitle="Fresh topics just discovered by the autonomous agent"
                      trends={autonomousResult.dashboardTrends.newestTrends} 
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "20px 40px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  onClick={() => useAppStore.setState({ autonomousResult: null })}
                  style={{ padding: "12px 24px", background: "white", color: "#64748B", border: "1px solid #CBD5E1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Discard
                </button>
                <button
                  onClick={handlePostResult}
                  style={{ padding: "12px 32px", background: "#2563EB", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  Post This Content <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Banner */}
      <div
        style={{
          borderRadius: 20,
          padding: "36px 40px",
          background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 40%, #F5F3FF 70%, #FDF2F8 100%)",
          border: "1px solid #DBEAFE",
          position: "relative",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: 30,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "#2563EB",
                      background: "#EFF6FF",
                      padding: "3px 10px",
                      borderRadius: 99,
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    Morning Briefing
                  </span>
                  <span style={{ fontSize: 11.5, color: "#8896A9" }}>
                    {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#0F1629",
                    letterSpacing: "-0.8px",
                    lineHeight: 1.2,
                    marginBottom: 6,
                  }}
                >
                  {greeting} 👋
                </h1>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#2563EB", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  What should I post today?
                </div>
                <p style={{ fontSize: 14.5, color: "#4A5568", fontWeight: 500, lineHeight: 1.6 }}>
                  I found{" "}
                  <span
                    style={{
                      color: "#2563EB",
                      fontWeight: 700,
                      background: "#EFF6FF",
                      padding: "0 6px",
                      borderRadius: 6,
                    }}
                  >
                    7 high-potential opportunities
                  </span>{" "}
                  today. Your audience is ready to engage.
                </p>
              </motion.div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  padding: "14px 20px",
                  background: "white",
                  borderRadius: 14,
                  border: "1px solid #E8ECF0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  textAlign: "center",
                  minWidth: 160,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#8896A9", marginBottom: 6 }}>
                  Best Opportunity
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1629", lineHeight: 1.4, marginBottom: 10 }}>
                  AI Agents Are<br />Replacing Jobs
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 12px",
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    color: "white",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <Zap size={11} />
                  Score 94/100
                </div>
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleRunAgent}
                style={{
                  padding: "12px 20px",
                  background: "#0F1629",
                  color: "white",
                  borderRadius: 12,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(15, 22, 41, 0.2)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Bot size={16} color="#3B82F6" />
                Run AI Content Engine
              </motion.button>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginTop: 28,
            }}
          >
            {STATS.map((stat, i) => {
              const Icon = ICON_MAP[stat.icon];
              const colors = COLOR_MAP[stat.color];
              return (
                <div
                  key={stat.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    style={{
                      padding: "16px 18px",
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 12,
                      border: `1px solid ${colors.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      height: "100%",
                      cursor: "help",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: colors.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} color={colors.icon} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {stat.label}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#0F1629", lineHeight: 1.1, marginBottom: 6 }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500, lineHeight: 1.4 }}>
                        {stat.description}
                      </div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: -4, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: "absolute",
                          bottom: "105%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 240,
                          background: "#0F1629",
                          color: "white",
                          padding: "10px 12px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 500,
                          lineHeight: 1.4,
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                          zIndex: 50,
                          pointerEvents: "none",
                          textAlign: "center",
                        }}
                      >
                        {stat.tooltip}
                        {/* Tooltip arrow */}
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid #0F1629",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}

