import { DiscoveredTrend } from "../agent/trendDiscovery";
import { Reel } from "../../types/index";

export interface GapOpportunity extends DiscoveredTrend {
  gapScore: number; // 0-100, refined
  historicalOverlap: number; // 0-100 penalty
  saturationScore: number; // 0-100 penalty
  recommendationReason: string;
  suggestedAngle: string;
}

/**
 * Detects gaps by comparing trending topics against user's history and overall saturation.
 */
export async function detectContentGaps(
  trends: DiscoveredTrend[],
  existingReels: Reel[]
): Promise<GapOpportunity[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const existingTopics = existingReels.map((r) => r.title.toLowerCase());
  const existingCategories = existingReels.map((r) => r.category.toLowerCase());

  const opportunities: GapOpportunity[] = trends.map((trend) => {
    let historicalOverlap = 0;
    let saturationScore = 0;
    let reason = "Prime hidden opportunity — zero historical overlap detected.";
    let suggestedAngle = `Focus on the exact moment ${trend.topic} changed the game.`;

    const tLower = trend.topic.toLowerCase();
    
    // Calculate Historical Overlap Penalty
    if (existingTopics.some(t => t.includes(tLower) || tLower.includes(t))) {
      historicalOverlap = 60;
      reason = "High overlap with previous content. High risk of audience fatigue.";
      suggestedAngle = "Pivot to an opposing viewpoint or contrary take to refresh the topic.";
    } else {
      const categoryMatches = existingCategories.filter(c => c === trend.category.toLowerCase()).length;
      if (categoryMatches > 2) {
        historicalOverlap = 25;
        reason = "Trending topic, but your library is saturated with this category.";
        suggestedAngle = "Cross-pollinate this topic with a completely different category (e.g. AI + Fitness).";
      } else if (categoryMatches > 0) {
        historicalOverlap = 10;
        reason = "Good opportunity. You have some coverage here, but this specific angle is fresh.";
      }
    }

    // Mock global saturation (in a real app, query internet volume)
    // Topics with massive velocity usually have higher saturation.
    saturationScore = Math.min(100, Math.round(trend.velocityScore * 0.5));

    // Refined Gap Score Math:
    // Start with trend power, subtract penalties for our own overlap and global saturation.
    const rawGapScore = trend.trendScore - (historicalOverlap * 0.5) - (saturationScore * 0.3);
    const finalGapScore = Math.max(0, Math.min(100, Math.round(rawGapScore)));

    if (finalGapScore > 85 && historicalOverlap === 0) {
      reason = "Golden Gap: High viral potential with zero existing content competition in your library.";
    }

    return {
      ...trend,
      gapScore: finalGapScore,
      historicalOverlap,
      saturationScore,
      recommendationReason: reason,
      suggestedAngle
    };
  });

  // Sort by gap score descending
  return opportunities.sort((a, b) => b.gapScore - a.gapScore);
}
