import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let query: any = db.collection("scripts");
    if (userId) {
      query = query.where("userId", "==", userId);
    }
    
    const snapshot = await query.orderBy("createdAt", "desc").limit(5).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0, reels: [] });
    }

    const reels = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Fetch corresponding prediction
      const viralityDoc = await db.collection("viralityPredictions").where("scriptId", "==", doc.id).limit(1).get();
      const viralityScore = !viralityDoc.empty ? viralityDoc.docs[0].data().viralityScore : 0;
      
      // Fetch trend for title
      const trendDoc = await db.collection("trends").doc(data.trendId).get();
      const trendTitle = trendDoc.exists ? trendDoc.data()?.title : "Custom Idea";

      reels.push({
        id: doc.id,
        title: trendTitle,
        sourceType: trendDoc.exists ? "trend" : "idea",
        status: "generated",
        viralityScore,
        createdAt: new Date(data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
    }

    return NextResponse.json({ success: true, count: reels.length, reels });
  } catch (error: any) {
    console.error("Failed to fetch recent scripts:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
