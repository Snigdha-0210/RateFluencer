import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { LinkedInResponse } from "@/types/linkedin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, category, audience } = body;

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    let genAI;
    try {
      genAI = getGeminiClient();
    } catch (envErr: any) {
      return NextResponse.json({ error: envErr.message }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a professional LinkedIn content creator. Generate a concise, high‑impact LinkedIn post (no more than 1300 characters) for the topic "${topic}". Also provide:
- An engagement hook (one short sentence that grabs attention)
- A list of 5‑7 relevant hashtags (without the # symbol)
Return ONLY a valid JSON object matching the interface:
{ "post": string, "hook": string, "hashtags": string[] }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let clean = responseText.trim();
    if (clean.startsWith("```json")) clean = clean.substring(7);
    if (clean.endsWith("```")) clean = clean.substring(0, clean.length - 3);
    clean = clean.trim();
    const data: LinkedInResponse = JSON.parse(clean);

    // Basic validation
    if (!data.post || !data.hook || !Array.isArray(data.hashtags)) {
      throw new Error("Gemini response missing required LinkedIn fields.");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("LinkedIn generation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to generate LinkedIn content" }, { status: 500 });
  }
}
