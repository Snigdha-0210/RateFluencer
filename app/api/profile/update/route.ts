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

    // Update CreatorPreferences
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (category) updateData.niche = category;
    
    // Merge existing audience or create new object
    const prefsDoc = await db.collection("creatorPreferences").doc(userId).get();
    let currentAudience = {};
    if (prefsDoc.exists) {
      try {
        currentAudience = JSON.parse(prefsDoc.data()?.audience || "{}");
      } catch (e) {}
    }

    const newAudience = {
      ...currentAudience,
      ...(ageGroups && { ageGroups }),
      ...(genders && { genders }),
      ...(regions && { regions }),
      ...(countries && { countries }),
      ...(occupations && { occupations }),
      ...(interests && { interests }),
    };

    updateData.audience = JSON.stringify(newAudience);

    await db.collection("creatorPreferences").doc(userId).set(updateData, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
