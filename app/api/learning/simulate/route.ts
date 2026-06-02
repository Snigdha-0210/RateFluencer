import { NextResponse } from "next/server";
import { simulateRealPerformance, getLearningState } from "@/lib/agent/learningEngine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { id, actualScore } = body;
  
  if (!id || typeof actualScore !== "number") {
    // If no specific ID, simulate for the latest prediction
    const state = getLearningState();
    const latestPending = state.predictions.filter(p => p.actualScore === null).pop();
    if (latestPending) {
        // Mock an actual score that deviates from prediction by a random amount (-15 to +5)
        const deviation = Math.floor(Math.random() * 20) - 15; 
        const simulatedScore = Math.max(0, Math.min(100, latestPending.predictedScore + deviation));
        const updatedState = simulateRealPerformance(latestPending.id, simulatedScore);
        return NextResponse.json(updatedState);
    }
    return NextResponse.json({ error: "No pending predictions to simulate." }, { status: 400 });
  }

  const updatedState = simulateRealPerformance(id, actualScore);
  return NextResponse.json(updatedState);
}
