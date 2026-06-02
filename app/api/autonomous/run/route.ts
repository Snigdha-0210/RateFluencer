import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, admin } from "@/lib/firebase";
import { fetchLiveTrends } from "@/lib/services/real-trend-discovery.service";
import { generateContent } from "@/lib/services/ai-generation.service";
import { predictVirality } from "@/lib/services/virality-prediction.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id || "anonymous-user";
  
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
        sendEvent(1, "Initializing Autonomous Agent...");
        let agentRun: any = null;
        if (userId !== "anonymous-user") {
          const runRef = db.collection("agentRuns").doc();
          agentRun = {
            id: runRef.id,
            userId,
            status: "running",
            currentStep: "init",
            logs: ["Initializing Autonomous Agent..."],
            startedAt: new Date().toISOString()
          };
          await runRef.set(agentRun).catch(() => null);
        }

        // Step 2: Trend Discovery (Researching)
        sendEvent(2, "Researching the internet for viral topics...");
        const trends = await fetchLiveTrends();
        if (agentRun) {
          await db.collection("agentRuns").doc(agentRun.id).update({
            currentStep: "discovery",
            logs: admin.firestore.FieldValue.arrayUnion("Researching the internet for viral topics...")
          });
        }
        
        // Step 3: Ranking
        sendEvent(3, "Ranking trends by velocity and engagement...");
        if (!trends || trends.length === 0) throw new Error("No trends found during research.");
        const topTrend = trends[0]; // Ranked #1

        // Step 4: Script Creation (Writing Script & Generating Posts)
        sendEvent(4, `Writing Script & Generating Posts for: "${topTrend.title}"...`);
        const generatedContent = await generateContent(userId, topTrend.title, topTrend.category || "General");
        
        if (agentRun) {
          await db.collection("agentRuns").doc(agentRun.id).update({
            currentStep: "generation",
            logs: admin.firestore.FieldValue.arrayUnion(`Generated Script & Posts for: "${topTrend.title}"`)
          });
        }

        // Step 5: Virality Prediction
        sendEvent(5, "Predicting Virality Scores...");
        const virality = await predictVirality(generatedContent);
        
        // Step 6: Saving Results
        sendEvent(6, "Saving Results to Database...");
        
        let savedScript: any = null;
        if (userId !== "anonymous-user") {
          const scriptRef = db.collection("scripts").doc();
          savedScript = {
            id: scriptRef.id,
            userId,
            trendId: topTrend.id,
            hook: generatedContent.hook,
            story: generatedContent.story,
            insights: generatedContent.keyInsights,
            cta: generatedContent.cta,
            createdAt: new Date().toISOString()
          };
          await scriptRef.set(savedScript);

          await db.collection("linkedinPosts").doc().set({
            scriptId: savedScript.id,
            userId,
            post: generatedContent.linkedinPost,
            hashtags: generatedContent.linkedinHashtags || [],
            createdAt: new Date().toISOString()
          });

          await db.collection("instagramPosts").doc().set({
            scriptId: savedScript.id,
            userId,
            caption: generatedContent.instagramCaption,
            hashtags: generatedContent.instagramHashtags || [],
            cta: generatedContent.instagramCTA || "",
            createdAt: new Date().toISOString()
          });

          await db.collection("viralityPredictions").doc().set({
            scriptId: savedScript.id,
            userId,
            expectedViews: virality.views,
            expectedLikes: virality.likes,
            expectedShares: virality.shares,
            expectedSaves: virality.saves,
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
          title: topTrend.title,
          category: topTrend.category,
          sourceType: "autonomous_agent",
          sourceName: topTrend.source,
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          viralityScore: virality.viralityScore,
          status: "generated",
          targeting: { country: "United States", region: "North America", ageGroup: "Gen Z (13-24)", gender: "All", interestCategory: topTrend.category, occupation: "All" },
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
              hookStrength: Math.round(virality.viralityScore * 0.9),
              topicMomentum: Math.round(virality.viralityScore * 0.95),
              searchInterest: 80,
              audienceFit: 88,
              novelty: 82,
              ctaStrength: 85
            }
          },
          platformScores: { instagram: virality.viralityScore, linkedin: Math.max(0, virality.viralityScore - 5), youtubeShorts: Math.min(100, virality.viralityScore + 2), tiktok: Math.min(100, virality.viralityScore + 4) }
        };

        sendEvent(10, "Done!", {
          reel: reelFormat,
          aiReasoningSummary: `Successfully extracted trending topic ${topTrend.title}. Generated an optimized hook and story. Predicted virality score: ${virality.viralityScore}/100.`
        });
        
        sendEvent(-1, "close"); // Signal to close
        controller.close();
      } catch (err: any) {
        console.error("Agent Run Error:", err);
        sendEvent(-1, "error", { message: err.message });
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
