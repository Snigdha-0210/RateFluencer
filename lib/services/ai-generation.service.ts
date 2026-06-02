import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../firebase";

let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function generateContent(userId: string, trendName: string, trendCategory: string) {
  // Fetch user preferences
  const prefsDoc = await db.collection("creatorPreferences").doc(userId).get();
  const prefs = prefsDoc.exists ? prefsDoc.data() : null;


  const targetAudience = prefs?.audience || "General Audience";
  const niche = prefs?.niche || "General Content";

  const prompt = `
    You are an expert AI Content Strategist.
    Create a highly engaging 30-60 second short-form video script based on the trending topic: "${trendName}" (Category: ${trendCategory}).
    The creator's niche is ${niche} and their target audience is: ${targetAudience}.

    Respond in strict JSON format with the following keys:
    - hook: (A catchy opening sentence)
    - story: (The core narrative or body of the script)
    - keyInsights: (Bullet points of the main takeaways)
    - cta: (A strong call to action)
    - linkedinPost: (A professional post for LinkedIn summarizing the video)
    - linkedinHashtags: (Array of strings, e.g. ["#AI", "#Tech"])
    - instagramCaption: (An engaging caption for Instagram reels)
    - instagramHashtags: (Array of strings)
    - instagramCTA: (A short CTA for instagram)
  `;

  if (process.env.GROQ_API_KEY) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const text = groqData.choices[0].message.content;
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : text;
        return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error("Groq generation failed, falling back to Gemini", e);
    }
  }

  if (!genAI) {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is not configured. Falling back to default script.");
    throw new Error(`Generation failed for ${trendName}. Please try again later.`);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    const parsed = JSON.parse(jsonStr);

    return parsed;
  } catch (error) {
    console.error("Gemini generation failed:", error);
    throw new Error(`Generation failed for ${trendName}. Please try again later.`);
  }
}
