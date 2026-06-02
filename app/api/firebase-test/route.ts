import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const testRef = db.collection("test").doc("test-doc");
    
    // Write
    await testRef.set({ testValue: "hello world", timestamp: Date.now() });
    
    // Read
    const snapshot = await testRef.get();
    const data = snapshot.data();

    if (data?.testValue === "hello world") {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: "Data mismatch" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Firebase Test Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
