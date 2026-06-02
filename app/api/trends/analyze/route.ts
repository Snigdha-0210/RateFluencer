import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { trendName, trendCategory, trendDescription } = await req.json();

    if (!trendName) {
      return NextResponse.json({ error: "Missing trend name" }, { status: 400 });
    }

    let analysisText = "";
    
    // Check if Groq API key is available for faster inference
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("Using Groq API for analysis...");
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant", // Supported Fast model
            messages: [{
              role: "user",
              content: `You are an expert social media analyst. Analyze this trend: "${trendName}" (Category: ${trendCategory}). Context: ${trendDescription}.
Return exactly 3 concise, punchy paragraphs: 
1) Why is this blowing up right now?
2) What is the core audience psychology driving it?
3) How can a creator make a viral video about this immediately? (Actionable format)`
            }],
            temperature: 0.7
          })
        });
        
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          analysisText = groqData.choices[0].message.content;
          console.log("Groq analysis succeeded.");
        } else {
          console.error("Groq API returned an error:", await groqRes.text());
        }
      } catch (e) {
        console.error("Groq generation failed, falling back to Gemini", e);
      }
    }
    
    // Fallback to Gemini if Groq failed or is not configured
    if (!analysisText) {
      const gemini = getGeminiClient();
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert social media analyst. Analyze this trend: "${trendName}" (Category: ${trendCategory}). Context: ${trendDescription}.
Return exactly 3 concise, punchy paragraphs: 
1) Why is this blowing up right now?
2) What is the core audience psychology driving it?
3) How can a creator make a viral video about this immediately? (Actionable format)`;
      
      const res = await model.generateContent(prompt);
      analysisText = res.response.text();
    }

    // Generate some mock chart data for the last 7 days representing growth
    const chartData = [];
    let base = 20 + Math.random() * 30;
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const val = Math.floor(base + (Math.random() * 15 - 5));
      chartData.push({
        name: d.toLocaleDateString("en-US", { weekday: 'short' }),
        value: val
      });
      // Ensure upward trend overall
      base += Math.random() * 10 + 5; 
    }

    return NextResponse.json({ 
      success: true, 
      analysis: analysisText,
      chartData 
    });

  } catch (error: any) {
    console.error("Analysis generation failed:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
