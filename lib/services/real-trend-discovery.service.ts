import { db } from "../firebase";

const SUBREDDITS = [
  "artificial", "ChatGPT", "startups", "entrepreneur", 
  "technology", "singularity", "sideproject", "SaaS"
];

export async function fetchLiveTrends() {
  console.log("🚀 Starting Real Trend Intelligence Pipeline...");

  const allRawTrends: Array<{
    source: string;
    title: string;
    url: string;
    category: string;
    score: number;
    comments: number;
    timePosted: number;
  }> = [];

  // 1. Fetch Reddit Public JSON
  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?limit=15&t=day`, {
        headers: { "User-Agent": "RateFluencer/1.0 Creator Intelligence Platform" }
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
            score: post.data.score || 0,
            comments: post.data.num_comments || 0,
            timePosted: post.data.created_utc * 1000,
          });
        }
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
      const storiesToFetch = topIds.slice(0, 30);

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
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error(`Error fetching Hacker News:`, e);
  }

  // 3. Fetch NewsAPI
  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey) {
      const newsCategories = ["Technology", "Business", "Startups", "Finance", "Artificial Intelligence"];
      for (const cat of newsCategories) {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(cat)}&sortBy=popularity&pageSize=10&apiKey=${newsApiKey}`);
        if (res.ok) {
          const data = await res.json();
          const articles = data.articles || [];
          for (const article of articles) {
            if (article.title && article.title !== "[Removed]") {
              allRawTrends.push({
                source: "NewsAPI",
                title: article.title,
                url: article.url,
                category: cat,
                score: 500, // Base proxy for NewsAPI popularity
                comments: 50,
                timePosted: new Date(article.publishedAt).getTime(),
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error(`Error fetching NewsAPI:`, e);
  }

  console.log(`✅ Fetched ${allRawTrends.length} raw trends from all sources.`);

  // 4. Normalize Data & Remove Duplicates
  const uniqueTrendsMap = new Map();
  for (const item of allRawTrends) {
    const normalizedTitle = item.title.toLowerCase().trim();
    if (!uniqueTrendsMap.has(normalizedTitle) || uniqueTrendsMap.get(normalizedTitle).score < item.score) {
      uniqueTrendsMap.set(normalizedTitle, item);
    }
  }
  const uniqueTrends = Array.from(uniqueTrendsMap.values());
  console.log(`🧹 Deduplicated down to ${uniqueTrends.length} unique trends.`);

  // 5. Calculate Metrics, Score, & Rank
  const now = Date.now();
  const rankedTrends = uniqueTrends.map((item: any) => {
    // Calculate Age in hours (min 0.5 to avoid Infinity)
    const hoursOld = Math.max((now - item.timePosted) / 3600000, 0.5);
    
    // Velocity: Score per hour
    let velocityRaw = item.score / hoursOld;
    let velocity = Math.min(Math.round((velocityRaw / 50) * 100), 100);
    
    // Engagement: Combining score and comments
    let engagementRaw = item.score + (item.comments * 2);
    let engagement = Math.min(Math.round((engagementRaw / 1500) * 100), 100);
    
    // Novelty (Base it strictly on how recent it is, no Math.random)
    let novelty = Math.max(100 - Math.round(hoursOld * 3.33), 10);
    
    // Relevance
    let relevance = 80;
    const lowerCategory = item.category.toLowerCase();
    if (["artificial", "chatgpt", "singularity", "startups", "saas"].includes(lowerCategory) || item.source === "Hacker News") relevance = 95;
    if (lowerCategory === "technology" || item.source === "NewsAPI") relevance = 85;

    // The Formula
    const trendScore = Math.round((velocity * 0.4) + (engagement * 0.3) + (novelty * 0.2) + (relevance * 0.1));

    return {
      title: item.title,
      source: item.source,
      url: item.url,
      category: item.category,
      engagement,
      velocity,
      novelty,
      relevance,
      trendScore,
      createdAt: new Date().toISOString()
    };
  });

  // Sort Descending
  rankedTrends.sort((a, b) => b.trendScore - a.trendScore);

  // Keep top 100
  const top100 = rankedTrends.slice(0, 100);

  // 6. Save strictly to Firestore
  const results = [];
  const trendsCollection = db.collection("trends");

  for (const item of top100) {
    try {
      const snapshot = await trendsCollection.where('title', '==', item.title).limit(1).get();
      let savedTrend;
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await docRef.update(item);
        savedTrend = { id: docRef.id, ...item };
      } else {
        const docRef = trendsCollection.doc();
        savedTrend = { id: docRef.id, ...item };
        await docRef.set(savedTrend);
      }
      results.push(savedTrend);
    } catch (e) {
      console.error(`Failed to save trend: ${item.title}`, e);
    }
  }

  console.log(`💾 Successfully stored top ${results.length} trends in Firestore.`);
  return results;
}
