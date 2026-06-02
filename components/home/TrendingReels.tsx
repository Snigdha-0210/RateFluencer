"use client";

import { motion } from "framer-motion";
import { Eye, Heart, Share2, Bookmark, Flame, Globe, Users, Smile, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ContentEvent } from "@/types/events";
import { useAppStore } from "@/store/useAppStore";
import { Reel } from "@/types";

export default function TrendingReels() {
  const [reels, setReels] = useState<ContentEvent[]>([]);
  const [bootstrapping, setBootstrapping] = useState(false);
  const setStoreReels = useAppStore((state) => state.setReels);

  const fetchReels = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) {
        const content = data.filter(d => d.type === "CONTENT_GENERATED") as ContentEvent[];
        
        if (content.length === 0) {
          // Trigger Bootstrapping!
          setBootstrapping(true);
          await fetch("/api/autonomous/run");
          // Re-fetch after the run completes
          const res2 = await fetch("/api/events");
          const data2 = await res2.json();
          const content2 = data2.filter((d: any) => d.type === "CONTENT_GENERATED") as ContentEvent[];
          setReels(content2.sort((a, b) => (b.viralityScore || b.predictedScore) - (a.viralityScore || a.predictedScore)).slice(0, 4));
          syncToStore(content2);
          setBootstrapping(false);
        } else {
          setReels(content.sort((a, b) => (b.viralityScore || b.predictedScore) - (a.viralityScore || a.predictedScore)).slice(0, 4));
          syncToStore(content);
        }
      }
    } catch (e) {
      console.error(e);
      setBootstrapping(false);
    }
  };

  const syncToStore = (events: ContentEvent[]) => {
    const mappedReels: Reel[] = events.map(e => ({
      id: e.id,
      title: e.topic,
      category: e.category,
      sourceType: e.trendId ? "trend" : "idea",
      sourceName: e.topic,
      createdAt: new Date(e.timestamp).toLocaleDateString(),
      viralityScore: e.predictedScore || e.viralityScore || 85,
      status: "generated",
      targeting: {
        country: "United States",
        region: "North America",
        ageGroup: "Gen Z (13-24)",
        gender: "All",
        interestCategory: e.category,
        occupation: "All"
      },
      draft: {
        id: `draft_${e.id}`,
        trendId: e.trendId || "custom",
        hook: e.hook,
        story: e.story,
        keyInsights: "",
        cta: e.cta,
        linkedInPost: "",
        instagramCaption: "",
        linkedInHashtags: [],
        instagramHashtags: [],
        instagramCTA: "",
        viralityScore: e.predictedScore || e.viralityScore || 85,
        expectedViews: e.expectedViewsLabel || "10K",
        expectedLikes: e.expectedLikesLabel || "1K",
        expectedShares: e.expectedSharesLabel || "500",
        expectedSaves: "200",
        breakdown: {
          hookStrength: 85,
          topicMomentum: 80,
          searchInterest: 75,
          audienceFit: 90,
          novelty: 82,
          ctaStrength: 88
        }
      },
      platformScores: { instagram: 85, linkedin: 80, youtubeShorts: 90, tiktok: 92 }
    }));
    setStoreReels(mappedReels);
  };

  useEffect(() => {
    fetchReels();
  }, []);

  if (bootstrapping) {
    return (
      <div style={{ marginBottom: 32, padding: "24px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <Loader2 className="animate-spin" color="#DC2626" />
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#991B1B" }}>Bootstrapping AI Engine...</h3>
          <p style={{ fontSize: 12, color: "#B91C1C" }}>Seeding real data and generating your first viral content script. Please wait.</p>
        </div>
      </div>
    );
  }

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
              {/* Category & Virality badge */}
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
                  {reel.category}
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
                  Score: {reel.viralityScore || reel.predictedScore}
                </div>
              </div>

              {/* Title */}
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 16 }}>
                {reel.topic}
              </h3>

              {/* Views & Engagement Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Views", value: reel.actualViews || reel.expectedViewsLabel, icon: Eye, color: "#2563EB" },
                  { label: "Likes", value: reel.actualLikes || reel.expectedLikesLabel, icon: Heart, color: "#DC2626" },
                  { label: "Shares", value: reel.actualShares || reel.expectedSharesLabel, icon: Share2, color: "#7C3AED" },
                  { label: "Comments", value: reel.actualComments || "0", icon: Bookmark, color: "#059669" }
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

              {/* Audience Breakdown */}
              <div
                style={{
                  padding: "10px",
                  background: "#FAFBFF",
                  border: "1px solid #EEF2FF",
                  borderRadius: 10,
                  fontSize: 11.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 16
                }}
              >
                <div style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: 9.5, letterSpacing: "0.4px" }}>
                  Primary Audience Demographics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ background: "#EFF6FF", color: "#2563EB", padding: "1px 6px", borderRadius: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                    <Globe size={10} /> Dynamic Audience
                  </span>
                </div>
              </div>
            </div>

            {/* Why It Worked */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
              <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Why It Worked
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: "#F0F3F6",
                      color: "var(--text-secondary)",
                      padding: "2px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)"
                    }}
                  >
                    💡 {reel.predictionError !== undefined ? `Error: ${reel.predictionError}` : "Awaiting actuals"}
                  </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
