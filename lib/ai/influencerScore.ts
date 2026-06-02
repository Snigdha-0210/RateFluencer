/**
 * Influencer Scoring Engine
 * Computes a 0-100 composite score from reach, engagement, authenticity, and growth signals.
 * Used by /api/influencers to rank creators and surface AI-powered explanations.
 */

export interface InfluencerScoreInput {
  /** Raw follower count (numeric) */
  followersRaw: number;
  /** Raw average views per video (numeric) */
  avgViewsRaw: number;
  /** Engagement rate as a percentage (e.g. 8.4) */
  engagementRate: number;
  /** Growth trend qualifier */
  growthTrend: "explosive" | "high" | "moderate" | "stable";
  /** Fake engagement probability (0–100, lower is better) */
  fakeEngagementRisk: number;
  /** How well the creator's audience matches your target (0–1, optional – defaults to 0.8) */
  audienceMatch?: number;
}

export interface InfluencerScoreBreakdown {
  /** 0-30: based on follower count and view volume */
  reachScore: number;
  /** 0-25: based on engagement rate relative to follower tier */
  engagementScore: number;
  /** 0-25: inverse of fake engagement risk */
  authenticityScore: number;
  /** 0-20: based on growth trend category */
  growthScore: number;
}

export interface InfluencerScoreResult {
  /** Composite 0-100 score */
  score: number;
  /** Sub-factor breakdown */
  breakdown: InfluencerScoreBreakdown;
  /** Risk level classification */
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  /** Human-readable explanation of why this influencer is rising or declining */
  reason: string;
}

// ─── Internal weight constants ─────────────────────────────────────────────────
// Total max = 30 + 25 + 25 + 20 = 100
const W_REACH = 30;
const W_ENGAGEMENT = 25;
const W_AUTHENTICITY = 25;
const W_GROWTH = 20;

// ─── Sub-factor scorers ────────────────────────────────────────────────────────

/**
 * reachScore (0-30):
 * Measures raw audience size + content distribution power.
 * Diminishing returns above 1M followers to avoid bias toward mega-accounts.
 */
function computeReachScore(followers: number, avgViews: number): number {
  // Follower tier score (0-18)
  let followerTier: number;
  if (followers >= 1_000_000) followerTier = 18;
  else if (followers >= 500_000) followerTier = 15;
  else if (followers >= 200_000) followerTier = 12;
  else if (followers >= 100_000) followerTier = 9;
  else if (followers >= 50_000) followerTier = 6;
  else followerTier = 3;

  // View-through rate tier score (0-12) — normalised against follower count
  const viewRatio = followers > 0 ? avgViews / followers : 0;
  let viewTier: number;
  if (viewRatio >= 1.0) viewTier = 12;
  else if (viewRatio >= 0.6) viewTier = 10;
  else if (viewRatio >= 0.4) viewTier = 8;
  else if (viewRatio >= 0.2) viewTier = 6;
  else if (viewRatio >= 0.1) viewTier = 4;
  else viewTier = 2;

  return Math.min(W_REACH, followerTier + viewTier);
}

/**
 * engagementScore (0-25):
 * Higher weight for micro/mid-tier creators with exceptional engagement,
 * slight penalty for mega accounts with inflated but passive audiences.
 */
function computeEngagementScore(engagementRate: number, followers: number): number {
  // Tier-adjusted benchmark (mega accounts typically see 1-2%)
  let benchmark: number;
  if (followers >= 1_000_000) benchmark = 1.5;
  else if (followers >= 500_000) benchmark = 2.5;
  else if (followers >= 200_000) benchmark = 4.0;
  else benchmark = 6.0;

  const ratio = engagementRate / benchmark;
  const raw = Math.min(1.5, ratio); // cap at 1.5× benchmark
  return Math.round(Math.min(W_ENGAGEMENT, raw * W_ENGAGEMENT));
}

/**
 * authenticityScore (0-25):
 * Computed as the inverse of fakeEngagementRisk.
 * Risk 0% → full 25 points. Risk 100% → 0 points.
 */
function computeAuthenticityScore(fakeRisk: number, audienceMatch: number): number {
  const riskFactor = Math.max(0, 1 - fakeRisk / 100);
  const matchFactor = Math.min(1, Math.max(0, audienceMatch));
  // Weighted: 70% risk-purity, 30% audience match
  const composite = riskFactor * 0.70 + matchFactor * 0.30;
  return Math.round(Math.min(W_AUTHENTICITY, composite * W_AUTHENTICITY));
}

/**
 * growthScore (0-20):
 * Maps qualitative trend to a score, biased toward velocity signals.
 */
function computeGrowthScore(growthTrend: InfluencerScoreInput["growthTrend"]): number {
  const MAP: Record<InfluencerScoreInput["growthTrend"], number> = {
    explosive: W_GROWTH,       // 20
    high: Math.round(W_GROWTH * 0.8),     // 16
    moderate: Math.round(W_GROWTH * 0.55), // 11
    stable: Math.round(W_GROWTH * 0.35),   // 7
  };
  return MAP[growthTrend] ?? 7;
}

// ─── Risk classifier ───────────────────────────────────────────────────────────

function classifyRisk(fakeRisk: number): "LOW" | "MEDIUM" | "HIGH" {
  if (fakeRisk >= 20) return "HIGH";
  if (fakeRisk >= 12) return "MEDIUM";
  return "LOW";
}

// ─── Reason generator ─────────────────────────────────────────────────────────

function buildReason(
  input: InfluencerScoreInput,
  breakdown: InfluencerScoreBreakdown,
  score: number
): string {
  const parts: string[] = [];

  // Growth narrative
  if (input.growthTrend === "explosive") {
    parts.push("is in explosive growth phase — follower velocity signals viral breakout potential");
  } else if (input.growthTrend === "high") {
    parts.push("shows strong consistent growth, indicating sustained audience interest");
  } else if (input.growthTrend === "moderate") {
    parts.push("is growing at a moderate pace — stable but not accelerating");
  } else {
    parts.push("has plateaued — growth has stabilised, limiting organic reach potential");
  }

  // Engagement commentary
  if (breakdown.engagementScore >= 20) {
    parts.push(`engagement rate of ${input.engagementRate}% is exceptionally high for this follower tier`);
  } else if (breakdown.engagementScore >= 15) {
    parts.push(`solid ${input.engagementRate}% engagement rate outperforms typical benchmarks`);
  } else {
    parts.push(`engagement rate of ${input.engagementRate}% is below optimal for maximum distribution`);
  }

  // Authenticity commentary
  if (input.fakeEngagementRisk >= 20) {
    parts.push(`⚠ High fake engagement risk (${input.fakeEngagementRisk}%) — inflated metrics reduce true ROI`);
  } else if (input.fakeEngagementRisk >= 12) {
    parts.push(`moderate authenticity concern (${input.fakeEngagementRisk}% risk) — monitor for organic drops`);
  } else {
    parts.push(`low fake engagement risk (${input.fakeEngagementRisk}%) — highly authentic audience`);
  }

  // Overall verdict
  const verdict =
    score >= 80 ? "Strong recommendation — high-ROI partnership candidate."
    : score >= 65 ? "Solid candidate — good reach-to-authenticity ratio."
    : score >= 50 ? "Use with caution — engagement or authenticity concerns present."
    : "Low priority — significant risk or stagnation signals.";

  return `Creator ${parts[0]}, with ${parts[1]}, and ${parts[2]}. ${verdict}`;
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Calculates a composite influencer score and breakdown.
 *
 * @param input - Raw influencer metrics
 * @returns Score (0-100), sub-factor breakdown, risk level, and explanation
 */
export function calculateInfluencerScore(input: InfluencerScoreInput): InfluencerScoreResult {
  const audienceMatch = input.audienceMatch ?? 0.8;

  const breakdown: InfluencerScoreBreakdown = {
    reachScore: computeReachScore(input.followersRaw, input.avgViewsRaw),
    engagementScore: computeEngagementScore(input.engagementRate, input.followersRaw),
    authenticityScore: computeAuthenticityScore(input.fakeEngagementRisk, audienceMatch),
    growthScore: computeGrowthScore(input.growthTrend),
  };

  const score = Math.min(100,
    breakdown.reachScore +
    breakdown.engagementScore +
    breakdown.authenticityScore +
    breakdown.growthScore
  );

  const riskLevel = classifyRisk(input.fakeEngagementRisk);
  const reason = buildReason(input, breakdown, score);

  return { score, breakdown, riskLevel, reason };
}
