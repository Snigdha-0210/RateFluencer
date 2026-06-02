import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    // Get top virality predictions globally
    const snapshot = await db.collection("viralityPredictions").orderBy("viralityScore", "desc").limit(5).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0, reels: [] });
    }

    const reels = [];
    for (const doc of snapshot.docs) {
      const viralityData = doc.data();
      
      // Fetch corresponding script
      const scriptDoc = await db.collection("scripts").doc(viralityData.scriptId).get();
      if (!scriptDoc.exists) continue;
      const scriptData = scriptDoc.data();
      
      // Fetch trend for title
      const trendDoc = await db.collection("trends").doc(scriptData?.trendId || "").get();
      const trendTitle = trendDoc.exists ? trendDoc.data()?.title : "Custom Idea";

      reels.push({
        id: scriptDoc.id,
        title: trendTitle,
        sourceType: trendDoc.exists ? "trend" : "idea",
        status: "published", // Assuming top trending are published
        viralityScore: viralityData.viralityScore,
        createdAt: new Date(scriptData!.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
    }

    return NextResponse.json({ success: true, count: reels.length, reels });
  } catch (error: any) {
    console.error("Failed to fetch trending scripts:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
