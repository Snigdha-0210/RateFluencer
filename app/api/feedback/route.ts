import { NextResponse } from "next/server";
import { ingestFeedback } from "@/lib/ai/learningEngine";
import { db } from "@/lib/firebase";
import { ContentEvent } from "@/types/events";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, actualMetrics } = body;

    if (!eventId || !actualMetrics) {
      return NextResponse.json({ error: "eventId and actualMetrics required" }, { status: 400 });
    }

    const doc = await db.collection("events").doc(eventId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "ContentEvent not found" }, { status: 404 });
    }

    const event = doc.data();
    if (event?.type !== "CONTENT_GENERATED") {
      return NextResponse.json({ error: "ContentEvent not found" }, { status: 404 });
    }

    const contentEvent = event as ContentEvent;
    
    await ingestFeedback(eventId, contentEvent, actualMetrics);

    return NextResponse.json({
      success: true,
      message: "Feedback ingested, weights updated, and metrics recomputed."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
