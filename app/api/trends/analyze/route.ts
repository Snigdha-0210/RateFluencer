import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { trendName, trendCategory, trendDescription, velocity = 85, trendUrl } = await req.json();

    if (!trendName) {
      return NextResponse.json({ error: "Missing trend name" }, { status: 400 });
    }

    let analysisText = "";
    let researchCards = [];
    let contentAngles = [];
    let chartData = [];

    // 1. Fetch real YouTube data if a URL is provided
    let realStats = "";
    let publishedAtStr = "";
    let viewCount = 0;
    
    if (trendUrl && trendUrl.includes("youtube.com") || trendUrl?.includes("youtu.be")) {
      try {
        const videoIdMatch = trendUrl.match(/(?:shorts\/|v=|youtu\.be\/)([^&?]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
          const videoId = videoIdMatch[1];
          const ytApiKey = process.env.YOUTUBE_API_KEY;
          
          if (ytApiKey) {
            console.log(`Fetching real YouTube stats for video: ${videoId}`);
            const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${ytApiKey}`);
            const ytData = await ytRes.json();
            
            if (ytData.items && ytData.items.length > 0) {
              const item = ytData.items[0];
              publishedAtStr = item.snippet.publishedAt;
              viewCount = parseInt(item.statistics.viewCount || "0");
              const likeCount = item.statistics.likeCount || "0";
              const commentCount = item.statistics.commentCount || "0";
              
              const publishedDate = new Date(publishedAtStr);
              const daysSinceUpload = Math.max(1, Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)));
              const avgViewsPerDay = Math.round(viewCount / daysSinceUpload);

              realStats = `
REAL-TIME YOUTUBE PERFORMANCE:
- Upload Date: ${publishedDate.toLocaleDateString()} (${daysSinceUpload} days ago)
- Total Views: ${viewCount.toLocaleString()}
- Total Likes: ${parseInt(likeCount).toLocaleString()}
- Total Comments: ${parseInt(commentCount).toLocaleString()}
- Average Velocity: ${avgViewsPerDay.toLocaleString()} views/day`;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch real YouTube stats:", e);
      }
    }

    const promptContext = `You are a data-driven content strategist for social media creators.
Deeply analyze this exact trending topic: "${trendName}"
Category: ${trendCategory}
Additional Context/Snippet: ${trendDescription}
${realStats}

Return ONLY valid JSON matching this exact structure:
{
  "analysis": "3 concise, actionable paragraphs explaining why this is blowing up (use the real stats if provided), audience psychology, and how to make a viral video about it.",
  "researchCards": [
    { "id": "r1", "title": "Search Volume", "value": "High", "subValue": "Rising fast", "trend": "up", "changePercent": 45, "icon": "Search" },
    { "id": "r2", "title": "Engagement Rate", "value": "8.5%", "subValue": "Above average", "trend": "up", "changePercent": 12, "icon": "Heart" },
    { "id": "r3", "title": "Momentum", "value": "Viral", "subValue": "Explosive growth", "trend": "up", "changePercent": 85, "icon": "TrendingUp" },
    { "id": "r4", "title": "Competition", "value": "Medium", "subValue": "Good opportunity", "trend": "down", "changePercent": -5, "icon": "Target" }
  ],
  "contentAngles": [
    { "id": "a1", "perspective": "Educational", "hook": "Stop scrolling if you want to know...", "predictedReach": "500K+", "virality": 85, "audienceFit": 90 },
    { "id": "a2", "perspective": "Controversial", "hook": "Why everyone is wrong about...", "predictedReach": "1M+", "virality": 95, "audienceFit": 80 },
    { "id": "a3", "perspective": "Storytime", "hook": "How I accidentally...", "predictedReach": "750K+", "virality": 88, "audienceFit": 95 },
    { "id": "a4", "perspective": "Actionable", "hook": "3 ways you can use...", "predictedReach": "250K+", "virality": 75, "audienceFit": 98 }
  ]
}`;

    // Enforce Groq API for faster inference
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing. Please add it to your .env.local file.");
    }

    console.log("Using Groq API for highly contextual analysis...");
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a JSON generating API. Always return valid JSON." },
          { role: "user", content: promptContext }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });
    
    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API Error:", errText);
      throw new Error(`Groq API Error: ${groqRes.statusText}`);
    }

    const groqData = await groqRes.json();
    let raw = groqData.choices[0].message.content.trim();
    if (raw.startsWith("```json")) raw = raw.slice(7);
    if (raw.endsWith("```")) raw = raw.slice(0, -3);
    
    const parsed = JSON.parse(raw.trim());
    analysisText = parsed.analysis || "Analysis unavailable.";
    researchCards = parsed.researchCards || [];
    contentAngles = parsed.contentAngles || [];
    console.log("Groq analysis succeeded.");

    // Generate accurate chart data based on ACTUAL upload date if available
    if (publishedAtStr) {
      const pubDate = new Date(publishedAtStr);
      const now = new Date();
      const daysSince = Math.max(1, Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Plot 7 data points from upload date to today
      let currentViews = 0;
      for (let i = 0; i <= 6; i++) {
        // Calculate the date for this point
        const pointDate = new Date(pubDate.getTime() + (i * (daysSince / 6) * 24 * 60 * 60 * 1000));
        
        // S-curve growth simulation to reach real view count
        const progress = i / 6;
        const sCurve = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        currentViews = Math.floor(viewCount * sCurve);
        
        // Scale to 0-100 for the chart Interest Score visually
        const scaledScore = Math.min(Math.floor((currentViews / Math.max(viewCount, 1)) * 100), 100);

        chartData.push({
          name: pointDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
          value: scaledScore,
          engagement: scaledScore > 0 ? Math.max(20, scaledScore - Math.floor(Math.random() * 15)) : 0
        });
      }
    } else {
      // Fallback chart if no real date
      let base = velocity / 2 + 5; 
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const multiplier = velocity > 85 ? 1.35 : 1.1;
        base = base * multiplier;
        chartData.push({
          name: d.toLocaleDateString("en-US", { weekday: 'short' }),
          value: Math.min(Math.floor(base), 100),
          engagement: Math.max(20, Math.min(Math.floor(base * 0.8), 100))
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      analysis: analysisText,
      researchCards,
      contentAngles,
      chartData 
    });

  } catch (error: any) {
    console.error("Analysis generation failed:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
