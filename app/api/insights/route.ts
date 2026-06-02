import { NextResponse } from "next/server";
import { getTopPerformingPatterns, getRawStore } from "@/lib/ai/learning";

/**
 * GET /api/insights
 *
 * Returns AI-powered content intelligence derived from the learning memory layer.
 * Includes top hook patterns, trending topics, and audience behaviour insights.
 * These are used by the Analyze page and Create page to surface "Why this worked" explanations.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") ?? "5", 10)));

    const patterns = getTopPerformingPatterns(limit);

    return NextResponse.json({
      topHooks: patterns.topHooks,
      topTopics: patterns.topTopics,
      audienceInsights: patterns.audienceInsights,
      systemStats: patterns.systemStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[insights] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to load insights" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/insights/debug
 * Internal endpoint — returns raw store state for debugging.
 */
export async function POST() {
  const raw = getRawStore();
  return NextResponse.json(raw);
}
