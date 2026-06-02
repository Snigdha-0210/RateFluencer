"use client";

import MorningBriefing from "@/components/home/MorningBriefing";
import CreateFromIdea from "@/components/home/CreateFromIdea";
import RecommendedCards from "@/components/home/RecommendedCards";
import AIActivityFeed from "@/components/home/AIActivityFeed";
import TopicLeaderboard from "@/components/home/TopicLeaderboard";
import GlobalTrends from "@/components/home/GlobalTrends";
import CategoryGrid from "@/components/home/CategoryGrid";
import RecentReels from "@/components/home/RecentReels";
import TrendingReels from "@/components/home/TrendingReels";
import ProfileOnboarding from "@/components/home/ProfileOnboarding";

export default function HomePage() {
  return (
    <>
      <ProfileOnboarding />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Morning Briefing Hero banner */}
        <MorningBriefing />

        {/* Input form to generate scripts from custom topics */}
        <CreateFromIdea />

        {/* Dynamic content grid: Recent Reels, Opportunities & AI feed */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <RecentReels />
            <TrendingReels />
            <RecommendedCards />
          </div>
          <AIActivityFeed />
        </div>

        {/* Topic ranks leaderboard and interactive Category shortcuts */}
        <TopicLeaderboard />
        
        {/* New Global Wide-Domain Trends */}
        <GlobalTrends />

        <CategoryGrid />
      </div>
    </>
  );
}
