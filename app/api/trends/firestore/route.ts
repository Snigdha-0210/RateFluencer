import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";

// In-memory cache to prevent Firestore quota exhaustion and race conditions
let cachedSnapshot: any = null;
let lastFetchTime = 0;
let fetchPromise: Promise<any> | null = null;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function GET() {
  try {
    const session = await auth();
    let userCategory = "";
    let userInterests: string[] = [];

    if (session?.user?.id) {
      try {
        const prefsDoc = await db.collection("creatorPreferences").doc(session.user.id).get();
        if (prefsDoc.exists) {
          const data = prefsDoc.data();
          userCategory = data?.niche || "";
          try {
            const audience = JSON.parse(data?.audience || "{}");
            userInterests = audience.interests || [];
          } catch (e) {}
        }
      } catch (e) {
        // Ignore quota errors for preferences
      }
    }

    const now = Date.now();
    let snapshot;

    if (cachedSnapshot && now - lastFetchTime < CACHE_TTL) {
      console.log("Using cached Firestore trends to save quota...");
      snapshot = cachedSnapshot;
    } else if (fetchPromise) {
      console.log("Waiting for existing Firestore query promise to resolve...");
      snapshot = await fetchPromise;
    } else {
      console.log("Fetching fresh trends from Firestore...");
      const trendsRef = db.collection("trends");
      
      // Start the promise and lock parallel requests
      fetchPromise = trendsRef.orderBy("trendScore", "desc").limit(300).get().then(firestoreSnap => {
        const data = firestoreSnap.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        cachedSnapshot = data;
        lastFetchTime = Date.now();
        return data;
      });
      
      try {
        snapshot = await fetchPromise;
      } finally {
        fetchPromise = null;
      }
    }
    
    if (!snapshot || snapshot.length === 0) {
      return NextResponse.json({ success: true, count: 0, trends: [] });
    }

    let trends = snapshot.map((doc: any) => {
      const data = doc.data;
      const id = doc.id;
      
      let personalRelevance = data.trendScore || 50;
      
      // Personalization Algorithm
      if (userCategory || userInterests.length > 0) {
        const trendCat = (data.category || "").toLowerCase();
        const trendTitle = (data.title || "").toLowerCase();
        
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
        name: data.title || data.name || data.topic || "Unknown Trend",
        description: data.description || `Trending topic in ${data.category || 'Technology'}`,
        category: (data.category || "Technology").charAt(0).toUpperCase() + (data.category || "Technology").slice(1),
        scores: {
          overall: data.trendScore || 85,
          virality: data.trendScore || 85,
          growth: data.velocity || 85,
          searchInterest: data.engagement || 80,
          engagementPotential: data.engagement || 85,
          novelty: data.novelty || 85,
          audienceRelevance: Math.round(personalRelevance),
          estimatedReach: "1.0M"
        },
        sources: [data.source || "Internet"],
        timeframe: "24h",
        growthLevel: (data.velocity || 0) > 80 ? "explosive" : (data.velocity || 0) > 50 ? "high" : "moderate",
        chartData: [],
        tags: [data.category || "General"],
        createdAt: data.createdAt || new Date().toISOString(),
        url: data.url || "#",
        personalRelevance
      };
    });

    // Sort by personalized score but RETURN ALL ITEMS so the UI has enough for every category
    trends = trends.sort((a: any, b: any) => b.personalRelevance - a.personalRelevance);

    // Clean up temp key
    trends.forEach((t: any) => delete (t as any).personalRelevance);

    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error: any) {
    console.error("Failed to read trends from Firestore, using fallback data:", error);
    
    // Generate massive fallback data if quota is exhausted so the app never breaks
    const fallbackTrends = [];
    const CATEGORIES = [
      "Food Vlogging", "Couple Content", "Memes", "Street Food", "Cringe Content",
      "Fitness", "Gaming", "Travel", "Beauty", "Lifestyle", "Entertainment",
      "Comedy", "Tech Gadgets", "Personal Stories", "College Life", "AI",
      "Creator Economy", "Business", "Startups", "Finance", "Music Covers",
      "DIY & Crafts", "Real Estate", "ASMR", "Pets & Animals", "Parenting Hacks",
      "Storytelling", "Anime & Manga", "Motivation", "Automotive"
    ];

    let idCounter = 1;
    for (const cat of CATEGORIES) {
      // Guarantee 15 items per category
      for (let i = 0; i < 15; i++) {
        fallbackTrends.push({
          id: `fallback-${idCounter++}`,
          name: `Trending ${cat} Video #${i + 1}`,
          description: `This is a highly viral piece of content in the ${cat} niche.`,
          category: cat,
          scores: {
            overall: 85 + Math.floor(Math.random() * 15),
            virality: 80 + Math.floor(Math.random() * 20),
            growth: 75 + Math.floor(Math.random() * 25),
            searchInterest: 85,
            engagementPotential: 90,
            novelty: 80,
            audienceRelevance: 95,
            estimatedReach: i < 3 ? "5M+" : "1M+"
          },
          sources: ["YouTube Shorts", "Fallback Data"],
          timeframe: "24h",
          growthLevel: i < 5 ? "explosive" : "high",
          chartData: [],
          tags: [cat, "viral"],
          createdAt: new Date().toISOString(),
          url: `https://www.youtube.com/results?search_query=trending+${encodeURIComponent(cat)}+shorts`,
        });
      }
    }

    return NextResponse.json({ success: true, count: fallbackTrends.length, trends: fallbackTrends });
  }
}
