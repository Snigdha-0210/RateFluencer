import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let country = (searchParams.get("geo") || "US").toUpperCase();
    
    const supported = ["AU", "CA", "DE", "FR", "GB", "IN", "JP", "SG", "US"];
    if (!supported.includes(country)) country = "US";

    console.log(`🌍 Fetching live YouTube Trends for ${country}...`);
    
    const ytApiKey = process.env.YOUTUBE_API_KEY;
    if (!ytApiKey) {
      throw new Error("YOUTUBE_API_KEY is not configured.");
    }

    const res = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatistics&chart=mostPopular&maxResults=20&key=${ytApiKey}`);
    
    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];
    
    const trends = items.map((item: any, index: number) => {
      const title = item.snippet.title;
      const desc = item.snippet.description || "";
      
      // Calculate a score based on views + rank
      const views = parseInt(item.statistics.viewCount || "0");
      const baseScore = Math.min(views / 100000, 50); // Up to 50 pts from views
      const rankScore = 50 - (index * 10); // Up to 50 pts from rank
      const score = Math.min(Math.round(baseScore + rankScore), 99);
      
      // Attempt to guess category
      let category = "Entertainment";
      const catId = item.snippet.categoryId;
      if (catId === "20") category = "Gaming";
      else if (catId === "10") category = "Music";
      else if (catId === "17") category = "Sports";
      else if (catId === "28") category = "Technology";
      else if (catId === "25") category = "News";
      else if (catId === "24") category = "Entertainment";
      else if (catId === "22") category = "Vlogging";
      else if (catId === "26") category = "Beauty";
      else if (catId === "27") category = "Education";

      return {
        id: `yt-${country}-${item.id}`,
        name: title,
        description: desc.substring(0, 150) + (desc.length > 150 ? "..." : ""),
        category: category,
        scores: {
          overall: score,
          virality: Math.min(score + 5, 99),
          growth: score,
          searchInterest: 95,
          engagementPotential: Math.max(score - 5, 70),
          novelty: 85,
          audienceRelevance: score,
          estimatedReach: `${(views / 1000000).toFixed(1)}M+ Views`
        },
        sources: ["YouTube", item.snippet.channelTitle],
        timeframe: "24h",
        growthLevel: score > 90 ? "explosive" : "high",
        chartData: [],
        tags: [country, category],
        createdAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id}`
      };
    });

    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error: any) {
    console.error(`Failed to fetch country trends:`, error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
