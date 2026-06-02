import { NextResponse } from "next/server";
import { fetchLiveTrends } from "@/lib/services/real-trend-discovery.service";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    // 1. Ingest Trends
    console.log("Triggering background trend refresh...");
    await fetchLiveTrends();

    // 2. Seed Influencers if empty
    const infSnap = await db.collection("influencers").limit(1).get();
    if (infSnap.empty) {
      console.log("Seeding influencers...");
      const batch = db.batch();
      const sampleInfluencer = {
        id: "inf_1",
        handle: "@techcreator_ai",
        name: "Alex Rivera",
        category: "AI & Technology",
        followers: "284K",
        engagementRate: 8.4,
        growthTrend: "explosive",
        fakeEngagementScore: 9,
        recentGrowth: "+34K / 30d",
        avgViews: "180K",
        audienceBreakdown: { topCountry: "US", topAge: "Gen Z", topInterest: "AI" }
      };
      batch.set(db.collection("influencers").doc("inf_1"), sampleInfluencer);
      await batch.commit();
    }

    // 3. Seed Ideas if empty
    const ideasSnap = await db.collection("ideas").limit(1).get();
    if (ideasSnap.empty) {
      console.log("Seeding ideas...");
      await db.collection("ideas").doc("default").set({
        list: [
          "The truth about AI agents nobody talks about",
          "How to scale a micro-SaaS with zero employees",
          "My exact 2026 content system"
        ]
      });
    }

    return NextResponse.json({ success: true, message: "Data refreshed successfully" });
  } catch (error: any) {
    console.error("Refresh failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
