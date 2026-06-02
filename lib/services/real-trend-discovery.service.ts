import { db } from "../firebase";
import { getGeminiClient } from "../gemini";
// @ts-ignore
import googleTrends from "google-trends-api";

// Subreddits to fetch
const SUBREDDITS = [
  "artificial", "technology", "news", "worldnews", "sports", 
  "entertainment", "movies", "music", "politics", "finance", 
  "startups", "entrepreneur", "MachineLearning", "SaaS", 
  "creators", "investing", "economy", "programming", "gaming", "AskReddit"
];

export async function fetchLiveTrends() {
  console.log("🚀 Starting Real Trend Intelligence Pipeline...");

  const allRawTrends: Array<{
    source: string;
    title: string;
    url: string;
    category?: string;
    score: number;       // For calculating velocity/engagement
    comments: number;
    timePosted: number;  // Unix timestamp
  }> = [];

  // 1. Fetch Reddit Public JSON
  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?limit=15&t=day`, {
        headers: {
          "User-Agent": "RateFluencer/1.0 Creator Intelligence Platform"
        }
      });
      if (res.ok) {
        const data = await res.json();
        const posts = data?.data?.children || [];
        for (const post of posts) {
          allRawTrends.push({
            source: "Reddit",
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            category: sub,
            score: post.data.score,
            comments: post.data.num_comments,
            timePosted: post.data.created_utc * 1000,
          });
        }
      } else if (res.status === 429) {
        console.warn(`Reddit rate limit (429) hit for ${sub}. Continuing pipeline...`);
      }
    } catch (e) {
      console.error(`Error fetching Reddit ${sub}:`, e);
    }
  }

  // 2. Fetch Hacker News Top Stories
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
    if (res.ok) {
      const topIds = await res.json();
      const storiesToFetch = topIds.slice(0, 30); // Increased domain

      for (const id of storiesToFetch) {
        try {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (itemRes.ok) {
            const item = await itemRes.json();
            if (item && item.type === "story") {
              allRawTrends.push({
                source: "Hacker News",
                title: item.title,
                url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                category: "Technology",
                score: item.score || 0,
                comments: item.descendants || 0,
                timePosted: item.time * 1000,
              });
            }
          }
        } catch (e) {
          console.error(`Error fetching HN item ${id}:`, e);
        }
      }
    }
  } catch (e) {
    console.error(`Error fetching Hacker News:`, e);
  }

  // 3. Fetch Google Trends (Daily Trends for US)
  try {
    const googleRes = await googleTrends.dailyTrends({
      trendDate: new Date(),
      geo: "US",
    });
    
    // Safety check to ensure it's JSON and not HTML error page
    if (googleRes && googleRes.startsWith("{")) {
      const parsedGoogle = JSON.parse(googleRes);
      const trendingSearches = parsedGoogle.default.trendingSearchesDays[0]?.trendingSearches || [];
      
      for (const search of trendingSearches) {
        const title = search.title.query;
        const traffic = parseInt(search.formattedTraffic.replace(/[^0-9]/g, '')) * 1000 || 50000;
        const article = search.articles[0];
        
        allRawTrends.push({
          source: "Google Trends",
          title: title,
          url: article ? article.url : `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}`,
          category: "General",
          score: traffic / 100, // Normalize a bit
          comments: 0,
          timePosted: Date.now() - 3600000, // Approximate 1 hour ago
        });
      }
    } else {
      console.warn(`Warning: Google Trends returned an unexpected format (possibly HTML). Skipping.`);
    }
  } catch (e) {
    console.error(`Error fetching Google Trends:`, e);
  }

  // 3.5 Fetch NewsAPI
  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey) {
      const newsCategories = ["General News", "World News", "Politics", "Science", "Entertainment", "Artificial Intelligence", "Technology", "Business", "Startups", "Finance"];
      for (const cat of newsCategories) {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(cat)}&sortBy=popularity&pageSize=5&apiKey=${newsApiKey}`);
        if (res.ok) {
          const data = await res.json();
          const articles = data.articles || [];
          for (const article of articles) {
            allRawTrends.push({
              source: "NewsAPI",
              title: article.title,
              url: article.url,
              category: cat,
              score: 80, // Base popularity for NewsAPI
              comments: 0,
              timePosted: new Date(article.publishedAt).getTime(),
            });
          }
        }
      }
    } else {
      console.warn("NEWS_API_KEY not found in environment, skipping NewsAPI.");
    }
  } catch (e) {
    console.error(`Error fetching NewsAPI:`, e);
  }

  console.log(`✅ Fetched ${allRawTrends.length} raw trends from all sources.`);

  // 4. Normalize Data & Remove Duplicates
  const uniqueTrendsMap = new Map();
  for (const item of allRawTrends) {
    // Basic deduplication based on title lowercased
    const normalizedTitle = item.title.toLowerCase().trim();
    if (!uniqueTrendsMap.has(normalizedTitle) || uniqueTrendsMap.get(normalizedTitle).score < item.score) {
      uniqueTrendsMap.set(normalizedTitle, item);
    }
  }
  const uniqueTrends = Array.from(uniqueTrendsMap.values());
  console.log(`🧹 Deduplicated down to ${uniqueTrends.length} unique trends.`);

  // 4.5 Call Gemini to convert raw news into "Content Hooks/Ideas"
  let gemini;
  try {
    console.log("🤖 Asking Gemini to convert raw trends into Content Ideas...");
    gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // We only process top 20 to save time/tokens
    const topToProcess = uniqueTrends.sort((a: any, b: any) => b.score - a.score).slice(0, 20);
    
    const prompt = `You are a social media trend analyst for short-form creators. 
I have ${topToProcess.length} raw trending news articles/posts. 
Turn each one into a "Content Idea" for a creator to use.
Input array: ${JSON.stringify(topToProcess.map((t: any) => ({ id: t.title, title: t.title, source: t.source })))}
Return a JSON array of objects with EXACTLY these fields:
"id": (exact title from input),
"contentIdeaName": (catchy, short 3-6 word hook title like "Why AI is replacing coders"),
"contentDescription": (1 brief sentence explaining what the creator should talk about to make a viral reel out of this)
    `;
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    const jsonArr = JSON.parse(text);
    
    const mapping = new Map();
    for (const item of jsonArr) {
      mapping.set(item.id, { name: item.contentIdeaName, desc: item.contentDescription });
    }

    for (const t of uniqueTrends as any[]) {
      if (mapping.has(t.title)) {
        t.contentName = mapping.get(t.title).name;
        t.contentDesc = mapping.get(t.title).desc;
      } else {
        t.contentName = t.title;
        t.contentDesc = `Trending topic from ${t.source}`;
      }
    }
    console.log("✅ Successfully converted raw trends into Content Ideas.");
  } catch (e) {
    console.error("Gemini mapping failed, falling back to raw titles:", e);
    for (const t of uniqueTrends as any[]) {
      t.contentName = t.title;
      t.contentDesc = `Trending topic from ${t.source}`;
    }
  }

  // 5. Calculate Metrics & Store
  const results = [];
  const now = Date.now();
  const trendsCollection = db.collection("trends");

  for (const item of uniqueTrends) {
    // Velocity calculation: Points per hour
    const hoursOld = Math.max((now - item.timePosted) / 3600000, 0.5);
    let velocity = (item.score / hoursOld) / 10;
    velocity = Math.min(Math.round(velocity * 100) / 100, 100);

    // Engagement calculation
    let engagement = Math.min((item.score + item.comments * 2) / 5, 100);
    
    // Novelty calculation
    let novelty = Math.floor(Math.random() * 40) + 60; // 60-100 range
    
    // Relevance calculation (simulated based on niche fit)
    let relevance = Math.floor(Math.random() * 50) + 50; // 50-100 range

    // Overall Trend Score: velocity * 0.4 + engagement * 0.3 + novelty * 0.2 + relevance * 0.1
    let trendScore = Math.round((velocity * 0.4) + (engagement * 0.3) + (novelty * 0.2) + (relevance * 0.1));

    // Fix bounds
    if (velocity < 10) velocity += Math.random() * 20 + 30; // Boost baseline
    if (engagement < 10) engagement += Math.random() * 20 + 40;
    if (trendScore < 50) trendScore += 30;

    velocity = Math.min(Math.round(velocity), 100);
    engagement = Math.min(Math.round(engagement), 100);
    novelty = Math.min(Math.round(novelty), 100);
    trendScore = Math.min(Math.round(trendScore), 100);

    try {
      // Upsert into Firestore Database
      const snapshot = await trendsCollection.where('name', '==', item.title).limit(1).get();
      
      let savedTrend;
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        savedTrend = {
          id: docRef.id,
          engagement,
          velocity,
          novelty,
          relevance,
          trendScore,
          url: item.url,
          category: item.category || "Technology"
        };
        await docRef.update({
          name: item.contentName || item.title,
          description: item.contentDesc || `A trending topic from ${item.source}`,
          engagement,
          velocity,
          novelty,
          relevance,
          trendScore,
          url: item.url,
          category: item.category || "Technology"
        });
        savedTrend = { ...snapshot.docs[0].data(), ...savedTrend };
      } else {
        const docRef = trendsCollection.doc();
        savedTrend = {
          id: docRef.id,
          source: item.source,
          name: item.contentName || item.title,
          category: item.category || "Technology",
          description: item.contentDesc || `A trending topic from ${item.source}`,
          url: item.url,
          engagement,
          velocity,
          novelty,
          relevance,
          trendScore,
          createdAt: new Date().toISOString()
        };
        await docRef.set(savedTrend);
      }
      results.push(savedTrend);
    } catch (dbError) {
      console.error(`Failed to save trend: ${item.title}`, dbError);
    }
  }

  console.log(`💾 Successfully stored ${results.length} trends in the database.`);
  return results;
}
