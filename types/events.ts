export interface ContentEvent {
  id: string;
  type: "CONTENT_GENERATED";
  timestamp: string;

  // Context
  trendId?: string;
  topic: string;
  category: string;

  // Generated Content
  hook: string;
  story: string;
  cta: string;
  fullScript: string;

  // Predicted (AI Generated)
  predictedScore: number;
  expectedViewsLabel?: string;
  expectedLikesLabel?: string;
  expectedSharesLabel?: string;

  // Actual Real-world Metrics (from feedback)
  actualViews?: number;
  actualLikes?: number;
  actualShares?: number;
  actualComments?: number;
  actualWatchTime?: number; // seconds

  // Computed Real Metrics
  engagementRate?: number;
  viralityScore?: number;
  predictionError?: number;
  modelAccuracy?: number;
}

export interface TrendEvent {
  id: string;
  type: "TREND_DISCOVERED";
  timestamp: string;
  source: string; // e.g. "reddit", "youtube"
  topic: string;
  title: string;
  url: string;
  momentum: number;
  volume: number;
}

export interface InfluencerEvent {
  id: string;
  type: "INFLUENCER_TRACKED";
  timestamp: string;
  handle: string;
  platform: string;
  followers: number;
  engagementRate: number;
}

export type OS_Event = ContentEvent | TrendEvent | InfluencerEvent;
