import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const trendsRef = db.collection("trends");
    // Fetch top 20 recent trends globally based on raw trendScore, ignoring user preferences
    const snapshot = await trendsRef.orderBy("trendScore", "desc").limit(20).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0, trends: [] });
    }

    const trends = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.topic || "Unknown Trend",
        description: data.description || `Trending topic in ${data.category || 'Technology'}`,
        category: data.category || "General",
        scores: {
          overall: data.trendScore || 85,
          virality: data.trendScore || 85,
          growth: data.velocity || data.trendScore || 85,
          searchInterest: 80,
          engagementPotential: data.engagement || 85,
          novelty: data.novelty || 85,
          audienceRelevance: data.trendScore || 85,
          estimatedReach: "1.0M"
        },
        sources: data.sources || (data.source ? [data.source] : []),
        timeframe: "24h",
        growthLevel: (data.velocity || 0) > 80 ? "explosive" : (data.velocity || 0) > 50 ? "high" : "moderate",
        chartData: [],
        tags: data.tags || [data.category || "General"],
        createdAt: data.createdAt || new Date().toISOString(),
        url: data.url || "#"
      };
    });

    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error: any) {
    console.error("Failed to read global trends from Firestore:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
