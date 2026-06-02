// ─────────────────────────────────────────────
//  CreatorOS — Shared TypeScript Types
// ─────────────────────────────────────────────

export type Category = string;

export type Source =
  | "Reddit"
  | "LinkedIn"
  | "YouTube"
  | "Twitter"
  | "News"
  | "Google Trends"
  | "TikTok"
  | "HackerNews"
  | "Instagram";

export type Timeframe = "24h" | "7d" | "30d" | "90d";

export type GrowthLevel = "explosive" | "high" | "moderate" | "stable";

// ─── Trend ───────────────────────────────────

export interface TrendScore {
  overall: number;        // 0–100
  virality: number;
  growth: number;         // percentage
  searchInterest: number;
  engagementPotential: number;
  novelty: number;
  audienceRelevance: number;
  estimatedReach: string; // e.g. "2.4M"
}

export interface Trend {
  id: string;
  name: string;
  category: Category;
  description: string;
  scores: TrendScore;
  sources: Source[];
  timeframe: Timeframe;
  growthLevel: GrowthLevel;
  chartData: ChartDataPoint[];
  tags: string[];
  createdAt: string;
  audience?: AudienceDistribution;
  url?: string;
}

// ─── Chart ───────────────────────────────────

export interface ChartDataPoint {
  date: string;
  value: number;
  engagement?: number;
  reach?: number;
}

// ─── Content ─────────────────────────────────

export interface ContentAngle {
  id: string;
  perspective: string;
  hook: string;
  predictedReach: string;
  virality: number;
  audienceFit: number;
  icon: string;
}

export interface ContentDraft {
  id: string;
  trendId: string;
  hook: string;
  story: string;
  keyInsights: string;
  cta: string;
  linkedInPost: string;
  instagramCaption: string;
  linkedInHashtags: string[];
  instagramHashtags: string[];
  instagramCTA: string;
  viralityScore: number;
  expectedViews: string;
  expectedLikes: string;
  expectedShares: string;
  expectedSaves: string;
  breakdown: ViralityBreakdown;
}

export interface ViralityBreakdown {
  hookStrength: number;
  topicMomentum: number;
  searchInterest: number;
  audienceFit: number;
  novelty: number;
  ctaStrength: number;
}

export type PipelineStep = {
  id: string;
  label: string;
  status: "done" | "in-progress" | "pending";
};

// ─── AI Activity ─────────────────────────────

export interface AIActivity {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  icon: string;
  status: "complete" | "running" | "queued";
}

// ─── Analytics ───────────────────────────────

export interface AnalyticsKPI {
  label: string;
  value: string;
  change: number; // percentage change
  trend: "up" | "down";
}

export interface ContentPerformance {
  id: string;
  title: string;
  trend: string;
  virality: number;
  reach: string;
  likes: string;
  shares: string;
  date: string;
  category: Category;
}

export interface AIInsight {
  id: string;
  insight: string;
  lift: string;
  category: string;
  icon: string;
}

// ─── Research Card ────────────────────────────

export interface ResearchCard {
  id: string;
  source: Source;
  title: string;
  value: string;
  subValue: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  icon: string;
}

// ─── Morning Briefing ────────────────────────

export interface BriefingStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─── Creator-Centric Custom Types ─────────────

export interface AudienceTargeting {
  country: string;
  region: string;
  ageGroup: string;
  gender: string;
  interestCategory: string;
  occupation: string;
}

export interface AudienceDistribution {
  countries: { name: string; percentage: number }[];
  regions: { name: string; percentage: number }[];
  ages: { range: string; percentage: number }[];
  genders: { name: string; percentage: number }[];
  interests: { name: string; percentage: number }[];
  occupations: { name: string; percentage: number }[];
  fitScore: number;
}

export interface TrendingReel {
  id: string;
  title: string;
  category: string;
  views: string;
  likes: string;
  shares: string;
  saves: string;
  viralityScore: number;
  topCountry: string;
  topRegion: string;
  topAgeGroup: string;
  topGender: string;
  primaryAudience: string;
  bestPlatform: string;
  whyItWorked: string[];
}

export interface Reel {
  id: string;
  title: string;
  category: string;
  sourceType: "trend" | "idea";
  sourceName: string;
  createdAt: string;
  viralityScore: number;
  status: "draft" | "generated" | "published" | "archived";
  draft: ContentDraft;
  targeting: AudienceTargeting;
  platformScores?: {
    instagram: number;
    linkedin: number;
    youtubeShorts: number;
    tiktok: number;
  };
}

export interface CreatorProfile {
  completed: boolean;
  category: string;
  countries: string[];
  regions: string[];
  ageGroups: string[];
  genders: string[];
  interests: string[];
  occupations: string[];
}
