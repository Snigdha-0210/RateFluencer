"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronDown, TrendingUp, Wand2, BarChart2, Zap, Lightbulb } from "lucide-react";
import { TrendEvent } from "@/types/events";
import { getCategoryColor } from "@/lib/utils";
import { Trend, Category, Source } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

const CATEGORIES: string[] = [
  "AI", "Technology", "Business", "Finance", "Startups", "Creator Economy", "Marketing", "Productivity", "Career",
  "Education", "Programming", "Science", "Politics", "History", "Travel", "Food", "Street Food", "Cooking",
  "Fitness", "Gym", "Sports", "Cricket", "Football", "Basketball", "Movies", "TV Shows", "Anime", "Gaming",
  "Pets", "Animals", "Nature", "Luxury", "Fashion", "Beauty", "Lifestyle", "Relationships", "Psychology",
  "Motivation", "Self Improvement", "Books", "Podcasts", "News", "Entertainment", "Memes", "Vlogging",
  "Personal Stories", "College Life", "Study Tips", "Entrepreneurship", "Side Hustles"
];

const SOURCE_COLORS: Record<string, string> = {
  Reddit: "#FF4500",
  LinkedIn: "#0077B5",
  YouTube: "#FF0000",
  News: "#6B7280",
  "Social Trends": "#7C3AED", // Purple for mapped social trends
};

const CATEGORY_INFOS = [
  { name: "AI", desc: "Large Language Models & Agentic workflows", gradient: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", color: "#1D4ED8", count: 3 },
  { name: "Creator Economy", desc: "Audience monetization & content trends", gradient: "linear-gradient(135deg, #FFF1F2, #FFE4E6)", color: "#E11D48", count: 2 },
  { name: "Technology", desc: "Software, Developer tools & CS trends", gradient: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", color: "#6D28D9", count: 1 },
  { name: "Business", desc: "Market dynamics & personal branding", gradient: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", color: "#047857", count: 2 },
  { name: "Startups", desc: "Founding, funding & product validation", gradient: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", color: "#C2410C", count: 1 },
  { name: "Finance", desc: "DeFi, investing & digital assets", gradient: "linear-gradient(135deg, #F0FDFA, #CCFBF1)", color: "#0F766E", count: 1 },
];

import TrendCard from "@/components/explore/TrendCard";

function NetflixRow({ title, subtitle, trends }: { title: string; subtitle?: string; trends: Trend[] }) {
  if (!trends || trends.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</p>}
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 16,
        }}
        className="netflix-scroll"
      >
        {trends.map((trend, i) => (
          <div key={trend.id} style={{ minWidth: 340, maxWidth: 340, flexShrink: 0 }}>
            <TrendCard trend={trend} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OpportunityBoardPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [selectedGrowth, setSelectedGrowth] = useState("All");
  const [trends, setTrends] = useState<Trend[]>([]);
  const setSelectedTrend = useAppStore((state) => state.setSelectedTrend);
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const beginnerMode = useAppStore((state) => state.beginnerMode);
  const setBeginnerMode = useAppStore((state) => state.setBeginnerMode);

  useEffect(() => {
    fetch("/api/trends/firestore")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.trends)) {
          setTrends(data.trends);
        }
      })
      .catch(console.error);
  }, []);

  // Dynamic generation for selected category
  const categoryTrends = trends.filter(t => t.category === selectedCategory);
  
  // Directly use categoryTrends or all trends without dynamic mock fallback
  const displayTrends = selectedCategory !== "All" ? categoryTrends : trends;

  const filtered = displayTrends.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
    if (selectedGrowth !== "All" && t.growthLevel !== selectedGrowth) return false;
    return true;
  });

  const isFiltered = search !== "" || selectedCategory !== "All" || selectedGrowth !== "All";

  // Sortings for Netflix rows
  const recommendedTrends = trends.filter((t) => t.scores.overall >= 85);
  const mostViralTrends = [...trends].sort((a, b) => b.scores.virality - a.scores.virality);
  const highestGrowthTrends = [...trends].sort((a, b) => b.scores.growth - a.scores.growth);
  const newestTrends = [...trends].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Explore</h1>
            <p className="page-subtitle">
              {trends.length} trends discovered today · Updated Live
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Beginner Mode Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                <Lightbulb size={14} color={beginnerMode ? "var(--accent)" : "var(--text-muted)"} style={{ fill: beginnerMode ? "var(--accent-light)" : "none" }} />
                Beginner Guide
              </span>
              <div
                onClick={() => setBeginnerMode(!beginnerMode)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 99,
                  background: beginnerMode ? "var(--accent)" : "#D1D9E0",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: beginnerMode ? 19 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                border: "1px solid #BFDBFE",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: "#2563EB",
              }}
            >
              <Zap size={14} />
              AI-Curated · Updated Live
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner for Beginners */}
      {beginnerMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #FFFBEB 0%, #FFFDF5 100%)",
            border: "1px solid #FCD34D",
            marginBottom: 20,
            display: "flex",
            alignItems: "flex-start",
            gap: 12
          }}
        >
          <div style={{ fontSize: 20, background: "#FEF3C7", padding: 8, borderRadius: 8, flexShrink: 0 }}>
            💡
          </div>
          <div>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
              AI Recommendation: How to Choose a Trend (Beginner Friendly Mode)
            </h3>
            <p style={{ fontSize: 12.5, color: "#B45309", lineHeight: 1.5, margin: 0 }}>
              Based on your profile category (<strong>{creatorProfile.category}</strong>), we recommend choosing trends with an <strong>Audience Fit Score above 80%</strong>. 
              Reels based on <strong>&quot;{creatorProfile.category}&quot;</strong> perform best on <strong>Instagram Reels</strong> and <strong>YouTube Shorts</strong>. 
              Focus on trends with high growth rate (e.g. <strong>explosive</strong> growth level) to piggyback on search momentum!
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div style={{ fontSize: 11.5, color: "#92400E", fontWeight: 600 }}>
                ⏰ Recommended Posting Times: <span style={{ fontWeight: 800 }}>6:00 PM - 8:30 PM</span> local time.
              </div>
              <div style={{ fontSize: 11.5, color: "#92400E", fontWeight: 600 }}>
                🎬 Suggested Format: <span style={{ fontWeight: 800 }}>Talking Head + Text Overlays</span>.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search trends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="trend-search"
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | "All")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text-primary)",
              background: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            id="growth-filter"
            value={selectedGrowth}
            onChange={(e) => setSelectedGrowth(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text-primary)",
              background: "white",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            <option value="All">All Growth</option>
            <option value="explosive">Explosive</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
          {filtered.length} results
        </div>
      </div>

      {/* Netflix Layout or Filter Grid */}
      <AnimatePresence mode="wait">
        {isFiltered ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((trend, i) => (
              <TrendCard key={trend.id} trend={trend} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="netflix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <NetflixRow
              title="Recommended For You"
              subtitle="Top opportunities matched to your content strategy profile"
              trends={recommendedTrends}
            />

            <NetflixRow
              title="Most Viral"
              subtitle="Content directions with maximum organic amplification potential"
              trends={mostViralTrends}
            />

            <NetflixRow
              title="Highest Growth"
              subtitle="Rising search interest and growth velocity today"
              trends={highestGrowthTrends}
            />

            <NetflixRow
              title="Newest Trends"
              subtitle="Freshly scanned and identified topics across public forums"
              trends={newestTrends}
            />

            {/* Trending Categories Section */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", marginBottom: 16 }}>
                Trending Categories
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {CATEGORY_INFOS.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name as Category);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      padding: "18px",
                      background: cat.gradient,
                      border: "1px solid rgba(0, 0, 0, 0.04)",
                      borderRadius: 12,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    className="card-hover"
                  >
                    <div style={{ fontSize: 15, fontWeight: 800, color: cat.color, marginBottom: 4 }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 12 }}>
                      {cat.desc}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, display: "flex", alignItems: "center", gap: 2 }}>
                      {cat.count} active opportunities <span style={{ transition: "transform 0.2s" }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
