import { Trend } from "@/types";
import { LinkedInResponse } from "@/types/linkedin";
import { ScriptResponse } from "@/types/script";
import { AgentReelResult, ViralityResult, ScoredInfluencer, InsightsResult } from "@/types/agent";

/**
 * Safe fetch helper to prevent JSON parsing errors on HTML responses.
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();
  
  if (!response.ok) {
    console.error(`API Error [${response.status}] at ${url}:`, text);
    let err: any = {};
    try {
      err = JSON.parse(text);
    } catch (e) {
      // Ignore, just returning text-based error
    }
    throw new Error(err.error || `Request failed with status ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`JSON Parse Error at ${url}:`, text);
    throw new Error("Invalid JSON response (possibly HTML returned)");
  }
}

/** Fetches real trend data from the Firestore API route. */
export async function getTrends(): Promise<Trend[]> {
  const data = await fetchJson<{ success: boolean; trends: Trend[] }>("/api/trends/firestore");
  return data.trends || [];
}

/** Generates a short-form video script using Gemini AI. */
export async function generateScript(
  topic: string,
  category: string,
  audience: string
): Promise<ScriptResponse> {
  return fetchJson<ScriptResponse>("/api/script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, category, audience }),
  });
}

/** Generates a LinkedIn post using Gemini AI. */
export async function generateLinkedInPost(
  topic: string,
  category: string,
  audience: string
): Promise<LinkedInResponse> {
  return fetchJson<LinkedInResponse>("/api/linkedin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, category, audience }),
  });
}

/**
 * Predicts virality score using the Phase 4 multi-factor engine.
 * Returns score, breakdown (hookStrength, emotionalTrigger, novelty, audienceFit, shareability),
 * improvement suggestions, and a one-line explanation.
 */
export async function predictVirality(
  topic: string,
  category: string,
  script: { hook: string; story?: string; cta: string },
  audienceData?: object
): Promise<ViralityResult> {
  return fetchJson<ViralityResult>("/api/virality", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, category, script, audienceData }),
  });
}

/** Generates 10 specific content ideas from a vague topic using Gemini. */
export async function expandIdeas(topic: string): Promise<string[]> {
  const data = await fetchJson<{ ideas: string[] }>("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  return data.ideas ?? [];
}

/**
 * Runs the full autonomous 9-step agent workflow:
 * Analyze → Trend context → Script → LinkedIn → Instagram → Virality (Phase 4) → Persist → Learn → Return
 */
export async function runReelAgent(
  idea: string,
  category: string,
  audience?: object
): Promise<AgentReelResult> {
  return fetchJson<AgentReelResult>("/api/generate-reel-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, category, audience: audience ?? {} }),
  });
}

/**
 * Fetches AI-scored influencer profiles ranked by composite score.
 * Returns ScoredInfluencer[] with aiScore, scoreBreakdown, riskLevel, reason, and rank.
 */
export async function fetchInfluencerScores(): Promise<ScoredInfluencer[]> {
  return fetchJson<ScoredInfluencer[]>("/api/influencers");
}

/**
 * Fetches AI insight engine output:
 * Top hook patterns, trending topics, audience behaviour insights, and system stats.
 * @param limit - Number of top patterns to return (default 5, max 10)
 */
export async function fetchInsights(limit = 5): Promise<InsightsResult> {
  return fetchJson<InsightsResult>(`/api/insights?limit=${limit}`);
}
