import { NextResponse } from "next/server";

/**
 * POST /api/virality
 *
 * Multi-factor virality prediction engine (Phase 4 upgrade).
 *
 * Scoring breakdown (max 100):
 *   Hook Strength       0–25  — power-word density + sentence structure
 *   Emotional Trigger   0–20  — emotional amplifier words + personal framing
 *   Novelty             0–20  — topic specificity + freshness signals
 *   Audience Fit        0–20  — targeting alignment + demographic match
 *   Shareability        0–15  — CTA quality + platform share patterns
 *
 * Returns: score, full breakdown, improvement suggestions, and reach estimates.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ViralityBreakdown {
  hookStrength: number;      // 0-25
  emotionalTrigger: number;  // 0-20
  novelty: number;           // 0-20
  audienceFit: number;       // 0-20
  shareability: number;      // 0-15
}

interface EnhancedViralityResult {
  /** Composite virality score 0-100 */
  viralityScore: number;
  /** Multi-factor breakdown */
  breakdown: ViralityBreakdown;
  /** Reach estimate ranges */
  expectedViews: string;
  expectedLikes: string;
  expectedShares: string;
  expectedSaves: string;
  /** Qualitative label */
  viralityLabel: "Low" | "Medium" | "High" | "Viral";
  /** Actionable improvement suggestions ordered by impact */
  suggestions: string[];
  /** One-line explanation for why this content will or won't perform */
  explanation: string;
}

// ─── Factor 1: Hook Strength (0–25) ──────────────────────────────────────────

const HOOK_POWER_WORDS = [
  "secret", "truth", "hack", "mistake", "viral", "exposed", "stop", "wait",
  "pov", "nobody", "you", "your", "now", "instantly", "proven", "shocking",
  "cheat", "blueprint", "step", "build", "scale", "actually", "real", "raw",
  "2026", "ai", "agents", "automated", "earn", "money", "free", "rich", "broke",
  "billion", "million", "quit", "fired", "warning", "banned", "hidden", "dark",
];

const HOOK_STRUCTURE_BONUS = [
  /^(nobody|no one)/i,       // nobody pattern
  /^(pov|point of view)/i,   // POV pattern
  /^(stop|wait)/i,           // interrupt pattern
  /\?$/,                     // question hook
  /^\d+\s/,                  // numbered list hook
  /^(how i|how to)/i,        // how-to hook
  /^(the truth|the secret)/i // revelation hook
];

function scoreHookStrength(hook: string): { score: number; missing: string[] } {
  const lower = hook.toLowerCase();
  const words = hook.split(/\s+/);

  // Power-word hits (0-15)
  const hits = HOOK_POWER_WORDS.filter((w) => lower.includes(w)).length;
  const powerScore = Math.min(15, hits * 3);

  // Structure bonus (0-7)
  const structureHits = HOOK_STRUCTURE_BONUS.filter((rx) => rx.test(hook.trim())).length;
  const structureScore = Math.min(7, structureHits * 4);

  // Length penalty: hooks >35 words lose punch
  const lengthPenalty = words.length > 35 ? -3 : words.length < 5 ? -2 : 0;

  const score = Math.min(25, Math.max(0, powerScore + structureScore + lengthPenalty));

  const missing: string[] = [];
  if (hits === 0) missing.push("Add a power word (e.g., 'secret', 'nobody talks about this', 'shocking truth')");
  if (structureHits === 0) missing.push("Use a proven hook structure: POV, numbered list, or question format");
  if (words.length > 35) missing.push("Shorten your hook — under 20 words performs best on mobile");

  return { score, missing };
}

// ─── Factor 2: Emotional Trigger (0–20) ──────────────────────────────────────

const EMOTION_WORDS: Record<string, number> = {
  // High-impact emotions (2 pts each)
  "shocked": 2, "unbelievable": 2, "life-changing": 2, "jaw-dropping": 2,
  "heartbreaking": 2, "mind-blowing": 2, "terrifying": 2, "insane": 2,
  // Mid-impact emotions (1.5 pts each)
  "amazing": 1.5, "incredible": 1.5, "powerful": 1.5, "urgent": 1.5,
  "real talk": 1.5, "honest": 1.5, "raw": 1.5, "vulnerable": 1.5,
  // Personal framing (1 pt each)
  "i was": 1, "i made": 1, "i lost": 1, "i earned": 1, "my story": 1,
  "changed my": 1, "saved me": 1, "ruined my": 1,
};

function scoreEmotionalTrigger(hook: string, story: string): { score: number; missing: string[] } {
  const combined = `${hook} ${story}`.toLowerCase();
  let raw = 0;
  for (const [word, weight] of Object.entries(EMOTION_WORDS)) {
    if (combined.includes(word)) raw += weight;
  }
  const score = Math.min(20, Math.round(raw * 2.5));

  const missing: string[] = [];
  if (score < 10) {
    missing.push("Add an emotional trigger: share a personal failure, shocking stat, or vulnerable moment");
  }
  if (score < 5) {
    missing.push("Increase emotional resonance — audiences share content that makes them FEEL something");
  }
  return { score, missing };
}

// ─── Factor 3: Novelty (0–20) ─────────────────────────────────────────────────

const HOT_TOPICS = ["ai", "agent", "automation", "chatgpt", "gemini", "side hustle",
  "creator economy", "passive income", "remote work", "2026", "startup", "solopreneur",
  "gen z", "viral", "tiktok", "reels", "linkedin", "budget", "financial freedom"];
const STALE_TOPICS = ["seo basics", "how to make money", "tips and tricks", "social media marketing 101"];

function scoreNovelty(topic: string, hook: string): { score: number; missing: string[] } {
  const combined = `${topic} ${hook}`.toLowerCase();

  const hotHits = HOT_TOPICS.filter((t) => combined.includes(t)).length;
  const staleHits = STALE_TOPICS.filter((t) => combined.includes(t)).length;

  // Specificity bonus: longer, more specific topics score higher
  const wordCount = topic.trim().split(/\s+/).length;
  const specificityBonus = wordCount >= 6 ? 4 : wordCount >= 4 ? 2 : 0;

  const score = Math.min(20, Math.max(0,
    8 + hotHits * 3 + specificityBonus - staleHits * 3
  ));

  const missing: string[] = [];
  if (hotHits === 0) missing.push("Tie your content to a trending topic (AI, creator economy, 2026 trends)");
  if (wordCount < 4) missing.push("Make your topic more specific — niche topics have less competition and higher virality");
  if (staleHits > 0) missing.push("Reframe your angle — this topic feels generic, add a unique data point or story");

  return { score, missing };
}

// ─── Factor 4: Audience Fit (0–20) ────────────────────────────────────────────

function scoreAudienceFit(
  category: string,
  audienceData: { ageGroup?: string; country?: string; interestCategory?: string } | null
): { score: number; missing: string[] } {
  if (!audienceData) return { score: 12, missing: ["Define a target audience for more accurate scoring"] };

  const age = audienceData.ageGroup ?? "";
  const interest = audienceData.interestCategory ?? category ?? "";
  const lower = `${age} ${interest}`.toLowerCase();

  // Age-category alignment matrix
  let alignmentScore = 10;
  if ((lower.includes("gen z") || lower.includes("18-24")) &&
    (lower.includes("ai") || lower.includes("creator") || lower.includes("tech") || lower.includes("career"))) {
    alignmentScore = 20;
  } else if ((lower.includes("millennial") || lower.includes("25-34")) &&
    (lower.includes("business") || lower.includes("finance") || lower.includes("startup") || lower.includes("invest"))) {
    alignmentScore = 18;
  } else if (lower.includes("gen z") || lower.includes("18-24")) {
    alignmentScore = 15;
  } else if (lower.includes("millennial")) {
    alignmentScore = 13;
  }

  const missing: string[] = [];
  if (alignmentScore < 12) {
    missing.push("Align your content category to your target audience for better distribution");
  }

  return { score: alignmentScore, missing };
}

// ─── Factor 5: Shareability (0–15) ───────────────────────────────────────────

const SHARE_CTA_PATTERNS = [
  "comment", "follow", "save this", "share this", "tag someone", "let me know",
  "drop a", "reply", "send this to", "watch until", "click the link",
  "dm me", "subscribe", "turn on", "bookmark",
];
const SHARE_HOOKS = ["if you", "share if", "tag a friend", "who needs to see this", "send to"];

function scoreShareability(cta: string, hook: string): { score: number; missing: string[] } {
  const ctaLower = cta.toLowerCase();
  const hookLower = hook.toLowerCase();

  const ctaHits = SHARE_CTA_PATTERNS.filter((p) => ctaLower.includes(p)).length;
  const hookShareHits = SHARE_HOOKS.filter((p) => hookLower.includes(p)).length;

  const score = Math.min(15, Math.max(0, ctaHits * 4 + hookShareHits * 3));

  const missing: string[] = [];
  if (ctaHits === 0) missing.push("Add a clear CTA: 'Save this', 'Share with someone who needs this', or 'Drop a comment'");
  if (score < 8) missing.push("Include a social-share trigger — ask viewers to tag someone or send this to a friend");

  return { score, missing };
}

// ─── Reach ranges ─────────────────────────────────────────────────────────────

function toReachRanges(score: number) {
  if (score >= 90) return { views: "500K – 2M", likes: "25K – 85K", shares: "8K – 22K", saves: "12K – 35K", label: "Viral" as const };
  if (score >= 78) return { views: "200K – 650K", likes: "10K – 28K", shares: "3K – 9K", saves: "5K – 14K", label: "High" as const };
  if (score >= 62) return { views: "80K – 250K", likes: "4K – 12K", shares: "1.2K – 3.5K", saves: "2K – 6K", label: "Medium" as const };
  return { views: "20K – 80K", likes: "1K – 4K", shares: "300 – 1.2K", saves: "500 – 2K", label: "Low" as const };
}

// ─── Explanation builder ──────────────────────────────────────────────────────

function buildExplanation(score: number, breakdown: ViralityBreakdown): string {
  const strongest = (Object.entries(breakdown) as [keyof ViralityBreakdown, number][])
    .sort((a, b) => b[1] / maxFor(b[0]) - a[1] / maxFor(a[0]))[0][0];
  const weakest = (Object.entries(breakdown) as [keyof ViralityBreakdown, number][])
    .sort((a, b) => a[1] / maxFor(a[0]) - b[1] / maxFor(b[0]))[0][0];

  const LABELS: Record<keyof ViralityBreakdown, string> = {
    hookStrength: "hook strength",
    emotionalTrigger: "emotional resonance",
    novelty: "topic novelty",
    audienceFit: "audience fit",
    shareability: "shareability",
  };

  if (score >= 85) return `Exceptional content — ${LABELS[strongest]} is the standout factor driving viral potential.`;
  if (score >= 70) return `Strong performer — ${LABELS[strongest]} excels, but improving ${LABELS[weakest]} could push this viral.`;
  if (score >= 55) return `Moderate potential — ${LABELS[weakest]} is holding this back significantly.`;
  return `Needs work — focus on ${LABELS[weakest]} first, then ${LABELS[strongest] !== weakest ? LABELS[strongest] : "emotional resonance"}.`;
}

function maxFor(factor: keyof ViralityBreakdown): number {
  const maxes: Record<keyof ViralityBreakdown, number> = {
    hookStrength: 25, emotionalTrigger: 20, novelty: 20, audienceFit: 20, shareability: 15
  };
  return maxes[factor];
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { script, topic, audienceData, category } = body;

    if (!topic && !script) {
      return NextResponse.json({ error: "topic or script is required" }, { status: 400 });
    }

    const hook = script?.hook ?? topic ?? "";
    const story = script?.story ?? "";
    const cta = script?.cta ?? "";

    // ── Run all five scoring factors ──────────────────────────────────────
    const hookResult = scoreHookStrength(hook);
    const emotionResult = scoreEmotionalTrigger(hook, story);
    const noveltyResult = scoreNovelty(topic ?? hook, hook);
    const audienceResult = scoreAudienceFit(category ?? "", audienceData ?? null);
    const shareResult = scoreShareability(cta, hook);

    const breakdown: ViralityBreakdown = {
      hookStrength: hookResult.score,
      emotionalTrigger: emotionResult.score,
      novelty: noveltyResult.score,
      audienceFit: audienceResult.score,
      shareability: shareResult.score,
    };

    const viralityScore = Math.min(100,
      breakdown.hookStrength +
      breakdown.emotionalTrigger +
      breakdown.novelty +
      breakdown.audienceFit +
      breakdown.shareability
    );

    // ── Collect ordered suggestions (highest impact first) ─────────────────
    const allSuggestions = [
      ...hookResult.missing,
      ...emotionResult.missing,
      ...noveltyResult.missing,
      ...audienceResult.missing,
      ...shareResult.missing,
    ];
    // Deduplicate and limit to 5
    const suggestions = [...new Set(allSuggestions)].slice(0, 5);

    const ranges = toReachRanges(viralityScore);
    const explanation = buildExplanation(viralityScore, breakdown);

    const result: EnhancedViralityResult = {
      viralityScore,
      breakdown,
      expectedViews: ranges.views,
      expectedLikes: ranges.likes,
      expectedShares: ranges.shares,
      expectedSaves: ranges.saves,
      viralityLabel: ranges.label,
      suggestions,
      explanation,
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[virality] error:", err);
    return NextResponse.json({ error: err.message ?? "Virality prediction failed" }, { status: 500 });
  }
}
