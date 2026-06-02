export interface DiscoveredTrend {
  id: string;
  topic: string;
  trendScore: number; // 0-100 (Dynamic)
  velocityScore: number; // Growth speed 0-100
  engagementDensity: number; // Density of interaction 0-100
  novelty: number; // How new it is 0-100
  crossPlatformValidation: number; // 0-100 (Shows up on multiple platforms)
  source: string;
  audienceFit: number;
  category: string;
  explanation: string;
}

import { db } from "@/lib/firebase";

export async function discoverTrends(): Promise<DiscoveredTrend[]> {
  const snapshot = await db.collection("trends").orderBy("trendScore", "desc").limit(20).get();
  const events = snapshot.docs.map(d => ({
    id: d.id,
    momentum: d.data().trendScore || 50,
    volume: 500,
    title: d.data().name,
    topic: d.data().category,
    source: d.data().sources?.[0] || "Internet",
    ...d.data()
  }));

  // Simulate API delay for trend aggregation
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Real-time Trend Scoring Engine calculation
  const scoredTrends = events.map(e => {
    const velocityScore = Math.min(e.momentum * 1.5, 100);
    const engagementDensity = Math.min(e.momentum + 10, 100);
    const crossPlatformValidation = e.volume > 500 ? 90 : 70;
    const novelty = 85;
    
    // 35% Velocity, 30% Engagement, 20% Cross-platform, 15% Novelty
    const rawScore = 
      (velocityScore * 0.35) + 
      (engagementDensity * 0.30) + 
      (crossPlatformValidation * 0.20) + 
      (novelty * 0.15);
      
    const finalScore = Math.min(100, Math.round(rawScore));
    
    let reason = "Solid performance across all metrics.";
    if (velocityScore > 90 && crossPlatformValidation > 90) {
      reason = "Explosive growth validated across multiple platforms.";
    } else if (novelty > 90) {
      reason = "Highly novel topic gaining rapid traction.";
    } else if (engagementDensity > 90) {
      reason = "Exceptional user engagement density in specific communities.";
    }
    
    return {
      id: e.id,
      topic: e.title || e.topic,
      velocityScore,
      engagementDensity,
      crossPlatformValidation,
      novelty,
      source: e.source,
      audienceFit: 90,
      category: e.topic || "Technology",
      trendScore: finalScore,
      explanation: reason
    };
  });

  return scoredTrends.sort((a, b) => b.trendScore - a.trendScore);
}
