import { getGeminiClient } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, category, audience } = body;

    if (!topic || topic.trim() === "") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    let genAI;
    try {
      genAI = getGeminiClient();
    } catch (envErr: any) {
      return NextResponse.json(
        { error: envErr.message },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a viral content creator. Generate a highly engaging 30-60 second mobile-first video script on the topic "${topic}".
The target category is "${category || "General"}" and the target audience/demographic is "${audience || "All"}".

Write in a punchy, viral creator style using short sentences, hooks, and high engagement techniques.

You MUST return your response as a valid JSON object matching the following structure:
{
  "hook": "An attention-grabbing opener (first 3 seconds)",
  "story": "A compelling narrative or context builder",
  "keyInsights": "Actionable, high-value insights or takeaways that the viewer would save",
  "cta": "A strong, open-ended question or request driving comments and follows"
}

Do not include any markdown styling, code block wrappers (like \`\`\`json), or extra text outside the JSON object. Return ONLY the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleanText = responseText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const scriptData = JSON.parse(cleanText);

    // Validate fields exist
    if (!scriptData.hook || !scriptData.story || !scriptData.keyInsights || !scriptData.cta) {
      throw new Error("Gemini response is missing required script fields.");
    }

    return NextResponse.json(scriptData);
  } catch (error: any) {
    console.error("Gemini script generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}
