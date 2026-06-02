"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Lightbulb, ArrowLeft, Loader2 } from "lucide-react";
import { Trend, Category } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import TrendCard from "@/components/explore/TrendCard";

const CATEGORIES: string[] = [
  "AI", "Technology", "Business", "Finance", "Startups", "Creator Economy", "Marketing", "Productivity", "Career",
  "Education", "Programming", "Science", "Politics", "History", "Travel", "Food", "Street Food", "Cooking",
  "Fitness", "Gym", "Sports", "Cricket", "Football", "Basketball", "Movies", "TV Shows", "Anime", "Gaming",
  "Pets", "Animals", "Nature", "Luxury", "Fashion", "Beauty", "Lifestyle", "Relationships", "Psychology",
  "Motivation", "Self Improvement", "Books", "Podcasts", "News", "Entertainment", "Memes", "Vlogging",
  "Personal Stories", "College Life", "Study Tips", "Entrepreneurship", "Side Hustles"
];

const CATEGORY_INFOS = [
  { name: "Food Vlogging", desc: "Restaurant reviews, recipes & food challenges", gradient: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", color: "#C2410C", count: 1 },
  { name: "Couple Content", desc: "Pranks, challenges & relationship humor", gradient: "linear-gradient(135deg, #FFF1F2, #FFE4E6)", color: "#E11D48", count: 2 },
  { name: "Memes", desc: "Relatable humor, trending audio & shitposting", gradient: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", color: "#6D28D9", count: 1 },
  { name: "Street Food", desc: "Local delicacies and hidden gems", gradient: "linear-gradient(135deg, #FEFCE8, #FEF08A)", color: "#A16207", count: 1 },
  { name: "Cringe Content", desc: "Satire, awkward moments & guilty pleasures", gradient: "linear-gradient(135deg, #FDF4FF, #FAE8FF)", color: "#A21CAF", count: 1 },
  { name: "Fitness", desc: "Gym routines, form checks & transformations", gradient: "linear-gradient(135deg, #ECFEFF, #CFFAFE)", color: "#0E7490", count: 1 },
  { name: "Gaming", desc: "Clips, easter eggs & streamer moments", gradient: "linear-gradient(135deg, #F0FDFA, #CCFBF1)", color: "#0F766E", count: 1 },
  { name: "Travel", desc: "Itineraries, hacks & aesthetic locations", gradient: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", color: "#047857", count: 1 },
  { name: "Beauty", desc: "Makeup tutorials, GRWM & product reviews", gradient: "linear-gradient(135deg, #FDF2F8, #FCE7F3)", color: "#BE185D", count: 1 },
  { name: "Lifestyle", desc: "Day in the life, vlogs & aesthetic living", gradient: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", color: "#1D4ED8", count: 1 },
  { name: "Entertainment", desc: "Pop culture, movie reviews & celeb drama", gradient: "linear-gradient(135deg, #FEF2F2, #FEE2E2)", color: "#B91C1C", count: 1 },
  { name: "Comedy", desc: "Skits, standup clips & funny reactions", gradient: "linear-gradient(135deg, #F8FAFC, #E2E8F0)", color: "#334155", count: 1 },
  { name: "Tech Gadgets", desc: "Unboxings, reviews & hidden features", gradient: "linear-gradient(135deg, #F0F9FF, #E0F2FE)", color: "#0369A1", count: 1 },
  { name: "Personal Stories", desc: "Storytimes, reddit threads & hot takes", gradient: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", color: "#15803D", count: 1 },
  { name: "College Life", desc: "Dorm tours, study hacks & student vlogs", gradient: "linear-gradient(135deg, #FFF1F2, #FFE4E6)", color: "#BE123C", count: 1 },
  { name: "AI", desc: "LLMs, Agentic workflows & prompts", gradient: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", color: "#1D4ED8", count: 3 },
  { name: "Creator Economy", desc: "Audience monetization & content trends", gradient: "linear-gradient(135deg, #FFF1F2, #FFE4E6)", color: "#E11D48", count: 2 },
  { name: "Business", desc: "Market dynamics & personal branding", gradient: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", color: "#047857", count: 2 },
  { name: "Startups", desc: "Founding, funding & product validation", gradient: "linear-gradient(135deg, #FFF7ED, #FFEDD5)", color: "#C2410C", count: 1 },
  { name: "Finance", desc: "DeFi, investing & digital assets", gradient: "linear-gradient(135deg, #F0FDFA, #CCFBF1)", color: "#0F766E", count: 1 },
  { name: "Music Covers", desc: "Singing, instruments & trending audios", gradient: "linear-gradient(135deg, #FCE7F3, #FBCFE8)", color: "#BE185D", count: 1 },
  { name: "DIY & Crafts", desc: "Lifehacks, restorations & art", gradient: "linear-gradient(135deg, #FEF08A, #FDE047)", color: "#A16207", count: 1 },
  { name: "Real Estate", desc: "House tours, flipping & investments", gradient: "linear-gradient(135deg, #E0F2FE, #BAE6FD)", color: "#0369A1", count: 1 },
  { name: "ASMR", desc: "Satisfying sounds, kinetic sand & whispers", gradient: "linear-gradient(135deg, #EDE9FE, #DDD6FE)", color: "#6D28D9", count: 1 },
  { name: "Pets & Animals", desc: "Funny cats, dog training & cute moments", gradient: "linear-gradient(135deg, #DCFCE7, #BBF7D0)", color: "#15803D", count: 1 },
  { name: "Parenting Hacks", desc: "Family vlogs, tips & relatable struggles", gradient: "linear-gradient(135deg, #FFE4E6, #FECDD3)", color: "#BE123C", count: 1 },
  { name: "Storytelling", desc: "Creepypastas, true crime & history", gradient: "linear-gradient(135deg, #DBEAFE, #BFDBFE)", color: "#1D4ED8", count: 1 },
  { name: "Anime & Manga", desc: "Reviews, edits & cosplay", gradient: "linear-gradient(135deg, #FFEDD5, #FED7AA)", color: "#C2410C", count: 1 },
  { name: "Motivation", desc: "Discipline, quotes & mindset shifts", gradient: "linear-gradient(135deg, #CCFBF1, #99F6E4)", color: "#0F766E", count: 1 },
  { name: "Automotive", desc: "Car reviews, detailing & racing clips", gradient: "linear-gradient(135deg, #F1F5F9, #E2E8F0)", color: "#334155", count: 1 }
];

function NetflixRow({ title, subtitle, trends }: { title: string; subtitle?: string; trends: Trend[] }) {
  if (!trends || trends.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            {title}
          </h2>
          {subtitle && <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</p>}
        </div>
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

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [trends, setTrends] = useState<Trend[]>([]);
  
  // State for Deep Fetching (Expanded Genre View)
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);
  const [deepFetchTrends, setDeepFetchTrends] = useState<Trend[]>([]);
  const [isDeepFetching, setIsDeepFetching] = useState(false);

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

    // Deep Link Handler
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        handleDeepFetch(catParam);
        // Clean up URL so refresh doesn't keep triggering
        window.history.replaceState(null, "", "/explore");
      }
    }
  }, []);

  const handleDeepFetch = async (category: string) => {
    setFocusedCategory(category);
    setIsDeepFetching(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch(`/api/trends/deep-fetch?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) {
        setDeepFetchTrends(data.trends);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeepFetching(false);
    }
  };

  const closeDeepFetch = () => {
    setFocusedCategory(null);
    setDeepFetchTrends([]);
  };

  const filtered = trends.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isSearching = search !== "";

  // Sortings for Netflix rows
  const recommendedTrends = trends.filter((t) => (t.scores?.overall || 0) >= 85);
  const mostViralTrends = [...trends].sort((a, b) => (b.scores?.virality || 0) - (a.scores?.virality || 0));
  const highestGrowthTrends = [...trends].sort((a, b) => (b.scores?.growth || 0) - (a.scores?.growth || 0));

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Explore</h1>
            <p className="page-subtitle">
              {focusedCategory 
                ? `100+ Live trends dynamically curated for ${focusedCategory}` 
                : `${trends.length} trends discovered today · Updated Live`
              }
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
              Live Feed
            </div>
          </div>
        </div>
      </div>

      {focusedCategory ? (
        // DEEP FETCH VIEW
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={closeDeepFetch}
              className="btn btn-secondary"
              style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", background: "white", borderRadius: 8, cursor: "pointer" }}
            >
              <ArrowLeft size={16} /> Back to Explore
            </button>
          </div>
          
          {isDeepFetching ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
              <Loader2 className="spinner" size={32} color="var(--accent)" />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                Scraping the internet for {focusedCategory} trends...
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>This usually takes 2-4 seconds.</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 20,
              }}
            >
              {deepFetchTrends.map((trend, i) => (
                <TrendCard key={trend.id} trend={trend} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        // DEFAULT NETFLIX VIEW
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                placeholder="Search across all genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="trend-search"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSearching ? (
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
                {/* Netflix Rows */}
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

                {/* Genre Deep Dives */}
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", marginBottom: 16 }}>
                    Explore Genres Deep Dive
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {CATEGORY_INFOS.map((cat) => (
                      <div
                        key={cat.name}
                        onClick={() => handleDeepFetch(cat.name)}
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
                          Load 100+ Topics <span style={{ transition: "transform 0.2s" }}>→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rows for All Genres */}
                {CATEGORY_INFOS.map((cat) => {
                  const catTrends = trends.filter(t => t.category.toLowerCase() === cat.name.toLowerCase());
                  if (catTrends.length === 0) return null;
                  return (
                    <NetflixRow
                      key={cat.name}
                      title={`Trending in ${cat.name}`}
                      trends={catTrends}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
