import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, type, context } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an elite short-form content scriptwriter. Your job is to improve the provided text to make it more engaging, viral, and concise. Do NOT add hashtags unless requested. ONLY return the improved text, nothing else. No conversational filler or surrounding quotes.",
          },
          {
            role: "user",
            content: `Improve this ${type} for a video about "${context}". Make it punchy and viral.\n\nOriginal Text: ${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const improved = data.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ success: true, text: improved });
  } catch (error: any) {
    console.error("Failed to improve text", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
