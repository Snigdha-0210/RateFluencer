// ─── Agent Reel Result ────────────────────────────────────────────────────────

export interface AgentReelResult {
  reel: {
    id: string;
    title: string;
    category: string;
    sourceType: "idea" | "trend";
    sourceName: string;
    createdAt: string;
    viralityScore: number;
    status: "generated";
    draft: {
      id: string;
      trendId: string;
      hook: string;
      story: string;
      keyInsights: string;
      cta: string;
      linkedInPost: string;
      linkedInHook: string;
      linkedInHashtags: string[];
      instagramCaption: string;
      instagramHashtags: string[];
      instagramCTA: string;
      viralityScore: number;
      expectedViews: string;
      expectedLikes: string;
      expectedShares: string;
      expectedSaves: string;
      /** Multi-factor breakdown from Phase 4 virality engine */
      breakdown: {
        hookStrength: number;
        emotionalTrigger: number;
        novelty: number;
        audienceFit: number;
        shareability: number;
        // Legacy fields (kept for backward-compat with existing reels in Zustand)
        topicMomentum?: number;
        searchInterest?: number;
        ctaStrength?: number;
      };
      /** One-line AI explanation of why this content will/won't perform */
      explanation?: string;
      /** Actionable improvement suggestions from the virality engine */
      suggestions?: string[];
      /** Qualitative label */
      viralityLabel?: "Low" | "Medium" | "High" | "Viral";
    };
    targeting: {
      country: string;
      region: string;
      ageGroup: string;
      gender: string;
      interestCategory: string;
      occupation: string;
    };
    platformScores: {
      instagram: number;
      linkedin: number;
      youtubeShorts: number;
      tiktok: number;
    };
  };
  agentLog: string[];
  persisted: boolean;
}

// ─── Virality Result ──────────────────────────────────────────────────────────

/** Phase 4 multi-factor virality result (returned by /api/virality) */
export interface ViralityResult {
  viralityScore: number;
  expectedViews: string;
  expectedLikes: string;
  expectedShares: string;
  expectedSaves: string;
  viralityLabel?: "Low" | "Medium" | "High" | "Viral";
  /** Multi-factor breakdown */
  breakdown: {
    hookStrength: number;
    emotionalTrigger: number;
    novelty: number;
    audienceFit: number;
    shareability: number;
    // Legacy sub-factors (optional, for backward-compat)
    topicMomentum?: number;
    searchInterest?: number;
    ctaStrength?: number;
  };
  /** Actionable improvement suggestions */
  suggestions?: string[];
  /** One-line explanation of expected performance */
  explanation?: string;
}

// ─── Influencer Types ─────────────────────────────────────────────────────────

export interface Influencer {
  id: string;
  handle: string;
  name: string;
  category: string;
  followers: string;
  engagementRate: number;
  growthTrend: "explosive" | "high" | "moderate" | "stable";
  fakeEngagementScore: number;
  audienceBreakdown: {
    topCountry: string;
    topAge: string;
    topInterest: string;
    genderSplit: { male: number; female: number; other: number };
  };
  recentGrowth: string;
  avgViews: string;
}

/** Phase 4 scored influencer (returned by /api/influencers) */
export interface ScoredInfluencer extends Influencer {
  /** Composite 0-100 AI score */
  aiScore: number;
  /** Sub-factor breakdown */
  scoreBreakdown: {
    reachScore: number;
    engagementScore: number;
    authenticityScore: number;
    growthScore: number;
  };
  /** Risk classification */
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  /** AI explanation of why this creator is rising/declining */
  reason: string;
  /** Rank position (1 = best) */
  rank: number;
}

// ─── Influencer Scoring ───────────────────────────────────────────────────────

export interface InfluencerScoreResult {
  score: number;
  breakdown: {
    reachScore: number;
    engagementScore: number;
    authenticityScore: number;
    growthScore: number;
  };
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export interface HookPattern {
  pattern: string;
  count: number;
  totalScore: number;
  avgScore: number;
}

export interface TopicPattern {
  topic: string;
  category: string;
  count: number;
  avgScore: number;
  totalScore: number;
}

export interface InsightsResult {
  topHooks: HookPattern[];
  topTopics: TopicPattern[];
  audienceInsights: string[];
  systemStats: {
    totalReelsGenerated: number;
    avgViralityScore: number;
    highPerformersCount: number;
  };
  generatedAt: string;
}
