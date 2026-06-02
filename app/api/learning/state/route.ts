import { NextResponse } from "next/server";
import { getLearningState } from "@/lib/agent/learningEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getLearningState());
}
