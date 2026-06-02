import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
