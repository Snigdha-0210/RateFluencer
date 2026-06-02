import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function predictVirality(scriptObj: any) {
  if (!genAI && !process.env.GROQ_API_KEY) {
    throw new Error("No AI API keys configured. Virality prediction failed.");
  }

  const prompt = `
    Analyze the following social media script and predict its virality metrics:
    Hook: ${scriptObj.hook}
    Story: ${scriptObj.story}

    Respond in strict JSON format with the following keys:
    - views: (String, e.g. "10K - 50K")
    - likes: (String, e.g. "500 - 2K")
    - shares: (String, e.g. "100 - 500")
    - saves: (String, e.g. "200 - 800")
    - viralityScore: (Number from 0 to 100)
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
    console.error("Gemini virality prediction failed:", error);
    throw new Error("Virality prediction failed due to AI API error.");
  }
}
