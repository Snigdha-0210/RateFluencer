import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await db.collection("users").doc(session.user.id).get();
    let profile = null;
    if (doc.exists) {
      profile = doc.data();
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
