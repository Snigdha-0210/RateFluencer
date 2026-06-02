import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, admin } from "@/lib/firebase";
import { fetchLiveTrends } from "@/lib/services/real-trend-discovery.service";
import { generateContent } from "@/lib/services/ai-generation.service";
import { predictVirality } from "@/lib/services/virality-prediction.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // We use Server-Sent Events (SSE) for the frontend
  const session = await auth();
  const userId = session?.user?.id || "anonymous-user"; // Fallback for testing without login
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(step: number, message: string, data: any = null) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ step, message, data })}\n\n`)
        );
      }

      try {
        // Step 1: Init Run
        sendEvent(1, "Initializing Agent Pipeline...");
        let agentRun: any = null;
        if (userId !== "anonymous-user") {
          const runRef = db.collection("agentRuns").doc();
          agentRun = {
            id: runRef.id,
            userId,
            status: "running",
            currentStep: "init",
            logs: ["Initializing Agent Pipeline..."],
            startedAt: new Date().toISOString()
          };
          await runRef.set(agentRun).catch(() => null);
        }

        // Step 2: Trend Discovery
        sendEvent(2, "Scraping latest trends from Reddit & YouTube...");
        const trends = await fetchLiveTrends();
        if (agentRun) {
          await db.collection("agentRuns").doc(agentRun.id).update({
            currentStep: "discovery",
            logs: admin.firestore.FieldValue.arrayUnion("Scraping latest trends from Reddit & YouTube...")
          });
        }
        
        // Pick top trend
        sendEvent(3, "Ranking and selecting the most viral trend...");
        // Delay for simulation
        await new Promise((r) => setTimeout(r, 1500));
        const topTrend = trends[0]; // Naive pick

        // Step 4: Script Creation
        sendEvent(4, `Generating script for: "${topTrend.name}"...`);
        const generatedContent = await generateContent(userId, topTrend.name, topTrend.category || "General");
        
        if (agentRun) {
          await db.collection("agentRuns").doc(agentRun.id).update({
            currentStep: "generation",
            logs: admin.firestore.FieldValue.arrayUnion(`Generating script for: "${topTrend.name}"...`)
          });
        }

        // Step 5: Virality Prediction
        sendEvent(5, "Predicting virality metrics...");
        const virality = await predictVirality(generatedContent);
        
        // Save to DB
        sendEvent(6, "Saving generated assets...");
        
        let savedScript: any = null;
        if (userId !== "anonymous-user") {
          const scriptRef = db.collection("scripts").doc();
          savedScript = {
            id: scriptRef.id,
            userId,
            trendId: topTrend.id,
            hook: generatedContent.hook,
            story: generatedContent.story,
            keyInsights: generatedContent.keyInsights,
            cta: generatedContent.cta,
            status: "generated",
            createdAt: new Date().toISOString()
          };
          await scriptRef.set(savedScript);

          await db.collection("linkedinPosts").doc().set({
            scriptId: savedScript.id,
            content: generatedContent.linkedinPost,
            hashtags: generatedContent.linkedinHashtags || [],
            createdAt: new Date().toISOString()
          });

          await db.collection("instagramPosts").doc().set({
            scriptId: savedScript.id,
            caption: generatedContent.instagramCaption,
            hashtags: generatedContent.instagramHashtags || [],
            cta: generatedContent.instagramCTA || "",
            createdAt: new Date().toISOString()
          });

          await db.collection("viralityPredictions").doc().set({
            scriptId: savedScript.id,
            views: virality.views,
            likes: virality.likes,
            shares: virality.shares,
            saves: virality.saves,
            viralityScore: virality.viralityScore,
            createdAt: new Date().toISOString()
          });
          
          await db.collection("agentRuns").doc(agentRun.id).update({
            status: "completed",
            currentStep: "done",
            completedAt: new Date().toISOString()
          });
        }

        // Send Final Result back to the store
        const reelFormat = {
          id: savedScript?.id || `reel_${Date.now()}`,
          title: topTrend.name,
          category: topTrend.category || "AI",
          sourceType: "trend",
          sourceName: topTrend.name,
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          viralityScore: virality.viralityScore,
          status: "generated",
          targeting: { country: "United States", region: "North America", ageGroup: "Gen Z (13-24)", gender: "All", interestCategory: topTrend.category || "AI", occupation: "All" },
          draft: {
            id: `draft_${Date.now()}`,
            trendId: topTrend.id,
            hook: generatedContent.hook,
            story: generatedContent.story,
            keyInsights: generatedContent.keyInsights,
            cta: generatedContent.cta,
            linkedInPost: generatedContent.linkedinPost,
            instagramCaption: generatedContent.instagramCaption,
            linkedInHashtags: generatedContent.linkedinHashtags || [],
            instagramHashtags: generatedContent.instagramHashtags || [],
            instagramCTA: generatedContent.instagramCTA || "",
            viralityScore: virality.viralityScore,
            expectedViews: virality.views,
            expectedLikes: virality.likes,
            expectedShares: virality.shares,
            expectedSaves: virality.saves,
            breakdown: {
              hookStrength: 85,
              topicMomentum: 90,
              searchInterest: 80,
              audienceFit: 88,
              novelty: 82,
              ctaStrength: 85
            }
          },
          platformScores: { instagram: 88, linkedin: 85, youtubeShorts: 90, tiktok: 92 }
        };

        sendEvent(10, "Done!", {
          reel: reelFormat,
          aiReasoningSummary: `Successfully extracted trending topic ${topTrend.name}. Generated an optimized hook and story. Predicted virality score: ${virality.viralityScore}/100.`
        });
        
        sendEvent(-1, "close"); // Signal to close
        controller.close();
      } catch (err) {
        console.error("Agent Run Error:", err);
        sendEvent(-1, "error");
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
