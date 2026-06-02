import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    let userCategory = "";
    let userInterests: string[] = [];

    if (session?.user?.id) {
      const prefsDoc = await db.collection("creatorPreferences").doc(session.user.id).get();
      if (prefsDoc.exists) {
        const data = prefsDoc.data();
        userCategory = data?.niche || "";
        try {
          const audience = JSON.parse(data?.audience || "{}");
          userInterests = audience.interests || [];
        } catch (e) {}
      }
    }

    const trendsRef = db.collection("trends");
    // Fetch top 150 recent trends to have a good pool for filtering
    const snapshot = await trendsRef.orderBy("trendScore", "desc").limit(150).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0, trends: [] });
    }

    let trends = snapshot.docs.map(doc => {
      const data = doc.data();
      
      let personalRelevance = data.trendScore || 50;
      
      // Personalization Algorithm
      if (userCategory || userInterests.length > 0) {
        const trendCat = (data.category || "").toLowerCase();
        const trendTitle = (data.name || "").toLowerCase();
        
        let matchScore = 0;
        
        if (userCategory && trendCat === userCategory.toLowerCase()) matchScore += 20;
        if (userCategory && trendTitle.includes(userCategory.toLowerCase())) matchScore += 10;
        
        for (const interest of userInterests) {
          if (trendCat.includes(interest.toLowerCase())) matchScore += 15;
          if (trendTitle.includes(interest.toLowerCase())) matchScore += 15;
        }

        // Cap relevance boost
        personalRelevance += Math.min(matchScore, 40);
        personalRelevance = Math.min(personalRelevance, 100);
      }

      return {
        id: doc.id,
        name: data.name || data.topic || "Unknown Trend",
        description: data.description || `Trending topic in ${data.category || 'Technology'}`,
        category: data.category || "Technology",
        scores: {
          overall: data.trendScore || 85,
          virality: data.trendScore || 85,
          growth: data.velocity || data.trendScore || 85,
          searchInterest: 80,
          engagementPotential: data.engagement || 85,
          novelty: data.novelty || 85,
          audienceRelevance: Math.round(personalRelevance), // Set audience relevance to our calculated score
          estimatedReach: "1.0M"
        },
        sources: data.sources || (data.source ? [data.source] : []),
        timeframe: "24h",
        growthLevel: (data.velocity || 0) > 80 ? "explosive" : (data.velocity || 0) > 50 ? "high" : "moderate",
        chartData: [],
        tags: data.tags || [data.category || "General"],
        createdAt: data.createdAt || new Date().toISOString(),
        url: data.url || "#", // Include URL for clickable headings
        personalRelevance // Temp key for sorting
      };
    });

    // Sort by personalized score and take top 50
    trends = trends.sort((a, b) => b.personalRelevance - a.personalRelevance).slice(0, 50);

    // Clean up temp key
    trends.forEach(t => delete (t as any).personalRelevance);

    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error: any) {
    console.error("Failed to read trends from Firestore:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
