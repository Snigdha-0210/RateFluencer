import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { category, countries, regions, ageGroups, genders, interests, occupations } = body;

    // Update or create Profile
    await db.collection("users").doc(userId).set({
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Update or create CreatorPreferences
    await db.collection("creatorPreferences").doc(userId).set({
      userId,
      niche: category,
      audience: JSON.stringify({ ageGroups, genders, regions, countries, occupations }),
      platforms: ["Instagram", "LinkedIn"],
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
