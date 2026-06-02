import { NextResponse } from "next/server";
import { fetchLiveTrends } from "@/lib/services/real-trend-discovery.service";

export async function GET() {
  try {
    const trends = await fetchLiveTrends();
    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error) {
    console.error("Failed to fetch live trends:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const trends = await fetchLiveTrends();
    return NextResponse.json({ success: true, count: trends.length, trends });
  } catch (error) {
    console.error("Failed to fetch live trends:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
