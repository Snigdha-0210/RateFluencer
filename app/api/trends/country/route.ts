import { NextResponse } from "next/server";
// @ts-ignore
import googleTrends from "google-trends-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("geo") || "US";

    console.log(`🌍 Fetching live Google Trends for ${country}...`);
    
    const googleRes = await googleTrends.dailyTrends({
      trendDate: new Date(),
      geo: country,
    });

    const parsedGoogle = JSON.parse(googleRes);
    const trendingSearches = parsedGoogle.default.trendingSearchesDays[0]?.trendingSearches || [];
    
    const trends = trendingSearches.slice(0, 20).map((search: any, index: number) => {
      const title = search.title.query;
      const traffic = parseInt(search.formattedTraffic.replace(/[^0-9]/g, '')) * 1000 || 50000;
      const article = search.articles?.[0];
      
      // We simulate score & category since Google Trends doesn't provide strict categories
      const score = Math.min(Math.round((traffic / 50000) * 100) + 50, 99);
      
      // Attempt to guess category based on title or article source
      let category = "General News";
      if (article) {
        const source = article.source.toLowerCase();
        if (source.includes("sport") || source.includes("espn") || title.toLowerCase().includes("match")) category = "Sports";
        else if (source.includes("tech") || source.includes("verge") || source.includes("wired")) category = "Technology";
        else if (source.includes("hollywood") || source.includes("entertainment") || title.toLowerCase().includes("movie")) category = "Entertainment";
        else if (source.includes("finance") || source.includes("market") || source.includes("bloomberg")) category = "Finance";
      }

      return {
        id: `gt-${country}-${index}-${Date.now()}`,
        name: title,
        description: article ? article.title : `Trending topic in ${country}`,
        category: category,
        scores: {
          overall: score,
          virality: score,
          growth: score,
          searchInterest: 95,
          engagementPotential: score - 10,
          novelty: 80,
          audienceRelevance: score,
          estimatedReach: `${(traffic / 1000).toFixed(0)}K+ Searches`
        },
        sources: ["Google Trends", article ? article.source : "Web Search"],
        timeframe: "24h",
        growthLevel: traffic > 100000 ? "explosive" : "high",
        chartData: [], // Filled dynamically if analyzed
        tags: [country, category],
        createdAt: new Date().toISOString(),
        url: article ? article.url : `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=${country}`
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
