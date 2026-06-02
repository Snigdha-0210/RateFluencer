import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { saveReel } from "@/lib/db/reels";
import { AgentReelResult } from "@/types/agent";
import { db } from "@/lib/firebase";
import { ContentEvent } from "@/types/events";

// ─── Enhanced virality computation (Phase 4 engine inlined) ───────────────────
// We inline the scoring logic here to avoid cross-route HTTP calls in the agent pipeline.
// The standalone /api/virality route exposes the same logic for client-side calls.

const HOOK_POWER_WORDS = [
  "secret", "hack", "viral", "stop", "pov", "nobody", "you", "now", "proven",
  "shocking", "blueprint", "ai", "agents", "automated", "earn", "free", "2026",
  "step", "scale", "actually", "truth", "exposed", "rich", "broke", "billion",
];
const EMOTION_WORDS: Record<string, number> = {
  "shocked": 2, "life-changing": 2, "jaw-dropping": 2, "mind-blowing": 2,
  "amazing": 1.5, "powerful": 1.5, "real talk": 1.5, "honest": 1.5, "raw": 1.5,
  "i was": 1, "i made": 1, "i lost": 1, "i earned": 1, "changed my": 1,
};
const SHARE_CTA_PATTERNS = [
  "comment", "follow", "save this", "share this", "tag someone", "let me know",
  "drop a", "reply", "send this to", "dm me",
];
const HOT_TOPICS = ["ai", "agent", "automation", "side hustle", "creator economy",
  "passive income", "remote work", "2026", "startup", "solopreneur", "gen z"];

function scoreHook(text: string): number {
  const lower = text.toLowerCase();
  const hits = HOOK_POWER_WORDS.filter((w) => lower.includes(w)).length;
  const wordCount = text.split(/\s+/).length;
  const structureBonus = /^(nobody|pov|stop|how i|\d+\s|the truth)/i.test(text.trim()) ? 5 : 0;
  const lengthPenalty = wordCount > 35 ? -3 : 0;
  return Math.min(25, Math.max(0, 8 + hits * 3 + structureBonus + lengthPenalty));
}

function scoreEmotion(hook: string, story: string): number {
  const combined = `${hook} ${story}`.toLowerCase();
  let raw = 0;
  for (const [word, weight] of Object.entries(EMOTION_WORDS)) {
    if (combined.includes(word)) raw += weight;
  }
  return Math.min(20, Math.round(raw * 2.5));
}

function scoreNovelty(topic: string): number {
  const lower = topic.toLowerCase();
  const hotHits = HOT_TOPICS.filter((t) => lower.includes(t)).length;
  const wordCount = topic.trim().split(/\s+/).length;
  const specificityBonus = wordCount >= 6 ? 4 : wordCount >= 4 ? 2 : 0;
  return Math.min(20, Math.max(0, 8 + hotHits * 3 + specificityBonus));
}

function scoreAudienceFit(category: string, ageGroup: string): number {
  const lower = `${ageGroup} ${category}`.toLowerCase();
  if ((lower.includes("gen z") || lower.includes("18-24")) &&
    (lower.includes("ai") || lower.includes("creator") || lower.includes("tech") || lower.includes("career"))) return 20;
  if ((lower.includes("millennial") || lower.includes("25-34")) &&
    (lower.includes("business") || lower.includes("finance") || lower.includes("startup"))) return 18;
  if (lower.includes("gen z")) return 15;
  if (lower.includes("millennial")) return 13;
  return 10;
}

function scoreShareability(cta: string): number {
  const lower = cta.toLowerCase();
  const hits = SHARE_CTA_PATTERNS.filter((p) => lower.includes(p)).length;
  return Math.min(15, Math.max(0, hits * 4));
}

function computeEnhancedVirality(hook: string, story: string, cta: string, category: string, ageGroup: string) {
  const breakdown = {
    hookStrength: scoreHook(hook),
    emotionalTrigger: scoreEmotion(hook, story),
    novelty: scoreNovelty(hook),
    audienceFit: scoreAudienceFit(category, ageGroup),
    shareability: scoreShareability(cta),
  };

  const score = Math.min(100,
    breakdown.hookStrength + breakdown.emotionalTrigger +
    breakdown.novelty + breakdown.audienceFit + breakdown.shareability
  );

  const label =
    score >= 90 ? "Viral" :
    score >= 78 ? "High" :
    score >= 62 ? "Medium" : "Low";

  const ranges =
    score >= 90 ? { views: "500K – 2M", likes: "25K – 85K", shares: "8K – 22K", saves: "12K – 35K" } :
    score >= 78 ? { views: "200K – 650K", likes: "10K – 28K", shares: "3K – 9K", saves: "5K – 14K" } :
    score >= 62 ? { views: "80K – 250K", likes: "4K – 12K", shares: "1.2K – 3.5K", saves: "2K – 6K" } :
                  { views: "20K – 80K", likes: "1K – 4K", shares: "300 – 1.2K", saves: "500 – 2K" };

  // Derive suggestions for the weakest factor
  const suggestions: string[] = [];
  if (breakdown.hookStrength < 12) suggestions.push("Strengthen hook: add a power word or POV/question structure");
  if (breakdown.emotionalTrigger < 8) suggestions.push("Add an emotional trigger: share a personal failure or shocking stat");
  if (breakdown.novelty < 10) suggestions.push("Tie content to a trending topic (AI, creator economy, 2026)");
  if (breakdown.audienceFit < 12) suggestions.push("Align content category to your target audience for better distribution");
  if (breakdown.shareability < 6) suggestions.push("Add a clear CTA: 'Save this' or 'Tag someone who needs to see this'");

  const explanation =
    score >= 85 ? "Strong viral potential — hook and emotional resonance are working together." :
    score >= 70 ? "Good performer — minor improvements to weak factors could push this viral." :
    score >= 55 ? "Moderate potential — key factors need strengthening." :
    "Needs significant work before publishing — review suggestions.";

  return { score, label, ranges, breakdown, suggestions, explanation };
}

// ─── Gemini call helper ───────────────────────────────────────────────────────

async function geminiJSON(model: any, prompt: string): Promise<any> {
  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();
  if (raw.startsWith("```json")) raw = raw.slice(7);
  if (raw.endsWith("```")) raw = raw.slice(0, -3);
  return JSON.parse(raw.trim());
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const agentLog: string[] = [];
  const log = (msg: string) => { agentLog.push(msg); console.log("[agent]", msg); };

  try {
    const body = await request.json().catch(() => ({}));
    const { idea, category = "General", audience = {} } = body;

    if (!idea || idea.trim().length === 0) {
      return NextResponse.json({ error: "idea is required" }, { status: 400 });
    }

    // ── Step 1: Analyze idea ───────────────────────────────────────────────
    log("Step 1: Analyzing input idea…");
    const cleanIdea = idea.trim();
    const ageGroup = audience.ageGroup ?? "Gen Z (13-24)";
    const country = audience.country ?? "United States";

    // ── Step 2: Enrich trend context ──────────────────────────────────────
    log("Step 2: Enriching trend context…");
    const trendContext = `Category: ${category}. Audience: ${ageGroup} in ${country}.`;

    // ── Step 3: Init Gemini ───────────────────────────────────────────────
    log("Step 3: Connecting to Gemini AI…");
    let genAI;
    try { genAI = getGeminiClient(); }
    catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // ── Step 4: Generate Script ───────────────────────────────────────────
    log("Step 4: Generating viral script…");
    const scriptPrompt = `You are a viral short-form video creator. Generate a high-impact 30-60 second reel script for: "${cleanIdea}". ${trendContext}
Return ONLY valid JSON:
{"hook":"string","story":"string","keyInsights":"string","cta":"string"}`;
    const script = await geminiJSON(model, scriptPrompt);

    // ── Step 5: Generate LinkedIn post ────────────────────────────────────
    log("Step 5: Generating LinkedIn post…");
    const linkedinPrompt = `Professional LinkedIn post (≤1300 chars) about: "${cleanIdea}". ${trendContext}
Return ONLY valid JSON:
{"post":"string","hook":"string","hashtags":["string"]}`;
    const linkedin = await geminiJSON(model, linkedinPrompt);

    // ── Step 6: Generate Instagram caption ───────────────────────────────
    log("Step 6: Generating Instagram caption…");
    const igPrompt = `Viral Instagram Reels caption for: "${cleanIdea}". ${trendContext}
Return ONLY valid JSON:
{"caption":"string","hashtags":["string"],"cta":"string"}`;
    const instagram = await geminiJSON(model, igPrompt);

    // ── Step 7: Predict virality (Phase 4 multi-factor engine) ────────────
    log("Step 7: Running Phase 4 multi-factor virality engine…");
    const virality = computeEnhancedVirality(
      script.hook, script.story, script.cta, category, ageGroup
    );
    log(`Step 7: Virality score ${virality.score}/100 (${virality.label}) — ${virality.explanation}`);

    // ── Step 8: Assemble + persist ────────────────────────────────────────
    log("Step 8: Assembling reel and persisting to database…");

    const reelId = `agent_${Date.now()}`;
    const platformScore = virality.score;

    const reel: AgentReelResult["reel"] = {
      id: reelId,
      title: cleanIdea,
      category,
      sourceType: "idea",
      sourceName: cleanIdea,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      viralityScore: virality.score,
      status: "generated",
      draft: {
        id: `draft_${reelId}`,
        trendId: "agent",
        hook: script.hook,
        story: script.story,
        keyInsights: script.keyInsights,
        cta: script.cta,
        linkedInPost: linkedin.post,
        linkedInHook: linkedin.hook,
        linkedInHashtags: linkedin.hashtags ?? [],
        instagramCaption: instagram.caption,
        instagramHashtags: instagram.hashtags ?? [],
        instagramCTA: instagram.cta ?? "",
        viralityScore: virality.score,
        expectedViews: virality.ranges.views,
        expectedLikes: virality.ranges.likes,
        expectedShares: virality.ranges.shares,
        expectedSaves: virality.ranges.saves,
        breakdown: virality.breakdown,
        explanation: virality.explanation,
        suggestions: virality.suggestions,
        viralityLabel: virality.label as "Low" | "Medium" | "High" | "Viral",
      },
      targeting: {
        country: audience.country ?? "United States",
        region: audience.region ?? "North America",
        ageGroup: audience.ageGroup ?? "Gen Z (13-24)",
        gender: audience.gender ?? "All",
        interestCategory: category,
        occupation: audience.occupation ?? "All",
      },
      platformScores: {
        instagram: Math.min(99, platformScore),
        linkedin: Math.min(99, platformScore - 3),
        youtubeShorts: Math.min(99, platformScore - 1),
        tiktok: Math.min(99, platformScore + 2),
      },
    };

    const persisted = await saveReel({
      id: reelId,
      title: cleanIdea,
      script: { hook: script.hook, story: script.story, keyInsights: script.keyInsights, cta: script.cta },
      linkedin_post: linkedin.post,
      instagram_caption: instagram.caption,
      trend_score: null,
      virality_score: virality.score,
      audience,
    });

    log(persisted ? "✓ Reel persisted to database." : "⚠ DB not configured — reel generated in memory only.");

    // ── Step 9 (NEW): Feed learning memory ───────────────────────────────
    log("Step 9: Storing performance data in real event store…");
    const agentResult: AgentReelResult = { reel, agentLog, persisted };
    
    const contentEvent: ContentEvent = {
      id: reelId,
      type: "CONTENT_GENERATED",
      timestamp: new Date().toISOString(),
      topic: cleanIdea,
      category,
      hook: script.hook,
      story: script.story,
      cta: script.cta,
      fullScript: JSON.stringify(script),
      predictedScore: virality.score,
      expectedViewsLabel: virality.ranges.views,
      expectedLikesLabel: virality.ranges.likes,
      expectedSharesLabel: virality.ranges.shares
    };
    
    await db.collection("events").doc(reelId).set(contentEvent);
    log(`✓ Real event logged: ContentEvent saved with predicted metrics.`);

    return NextResponse.json(agentResult);

  } catch (err: any) {
    console.error("[agent] fatal error:", err);
    return NextResponse.json({ error: err.message ?? "Agent workflow failed", agentLog }, { status: 500 });
  }
}
