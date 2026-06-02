import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
// @ts-ignore
import googleTrends from "google-trends-api";

export async function GET() {
  let redditCount = 0;
  let hackerNewsCount = 0;
  let newsApiCount = 0;
  let googleTrendsCount = 0;
  let firestoreWriteSuccess = false;
  let firestoreReadSuccess = false;
  let sampleTrend = null;

  try {
    // 1. Check Reddit
    try {
      const res = await fetch(`https://www.reddit.com/r/technology/top.json?limit=15&t=day`);
      if (res.ok) {
        const data = await res.json();
        redditCount = data?.data?.children?.length || 0;
      }
    } catch (e) {
      console.error("Reddit check error", e);
    }

    // 2. Check HN
    try {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
      if (res.ok) {
        const topIds = await res.json();
        hackerNewsCount = topIds?.length || 0;
      }
    } catch (e) {
      console.error("HN check error", e);
    }

    // 3. Check NewsAPI - Not implemented in service
    newsApiCount = 0;

    // 4. Check Google Trends
    try {
      const googleRes = await googleTrends.dailyTrends({ trendDate: new Date(), geo: "US" });
      if (googleRes && googleRes.startsWith("{")) {
        const parsedGoogle = JSON.parse(googleRes);
        googleTrendsCount = parsedGoogle?.default?.trendingSearchesDays?.[0]?.trendingSearches?.length || 0;
      }
    } catch (e) {
      console.error("Google trends error", e);
    }

    // 5 & 6. Firestore
    const testDoc = db.collection("trends").doc("debug-test");
    await testDoc.set({ title: "Debug Trend", createdAt: Date.now() });
    firestoreWriteSuccess = true;
    
    const readDoc = await testDoc.get();
    if (readDoc.exists) {
      firestoreReadSuccess = true;
    }

    // 7. Get Sample Trend
    const trendsSnapshot = await db.collection("trends").limit(1).get();
    if (!trendsSnapshot.empty) {
      sampleTrend = trendsSnapshot.docs[0].data();
    }

    return NextResponse.json({
      redditCount,
      hackerNewsCount,
      newsApiCount,
      googleTrendsCount,
      firestoreWriteSuccess,
      firestoreReadSuccess,
      sampleTrend
    });
  } catch (error: any) {
    return NextResponse.json({
      redditCount,
      hackerNewsCount,
      newsApiCount,
      googleTrendsCount,
      firestoreWriteSuccess,
      firestoreReadSuccess,
      sampleTrend,
      error: error.message
    }, { status: 500 });
  }
}
