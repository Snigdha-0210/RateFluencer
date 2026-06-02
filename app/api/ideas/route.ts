import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    let genAI;
    try {
      genAI = getGeminiClient();
    } catch (envErr: any) {
      return NextResponse.json({ error: envErr.message }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a viral content strategist. A creator gave you this vague topic: "${topic}".

Generate exactly 10 specific, highly engaging content ideas they could create a short-form video reel about.
Each idea should be:
- Specific (not generic)
- Actionable and unique
- Written as a compelling video title
- Between 6 and 12 words long
- Optimized for viral potential on Instagram Reels, TikTok, and YouTube Shorts

Return ONLY a valid JSON array of 10 strings. No extra text, no markdown.
Example format: ["Idea one here", "Idea two here", ...]`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    let ideas: string[] = [];
    try {
      ideas = JSON.parse(raw);
      if (!Array.isArray(ideas)) throw new Error("Not an array");
      ideas = ideas.slice(0, 10).map((i: any) => String(i));
    } catch {
      // Fallback: extract from Firestore ideas
      const { db } = require("@/lib/firebase");
      const snap = await db.collection("ideas").doc("default").get();
      if (snap.exists) {
        ideas = snap.data().list || [];
      } else {
        ideas = [];
      }
    }

    return NextResponse.json({ ideas });
  } catch (err: any) {
    console.error("[ideas] error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate ideas" }, { status: 500 });
  }
}
