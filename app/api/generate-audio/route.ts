import { NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { scriptId, text } = await req.json();

    if (!scriptId || !text) {
      return NextResponse.json({ success: false, error: "Missing scriptId or text" }, { status: 400 });
    }

    console.log(`🎙️ Generating Free Voiceover for script: ${scriptId}`);
    
    // google-tts-api handles long text automatically by splitting it
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?'
    });

    // Concatenate the base64 audio buffers into one playable MP3 data URI
    const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    const audioUrl = `data:audio/mp3;base64,${finalBuffer.toString('base64')}`;

    // Update Firestore Document if it exists
    try {
      const docRef = db.collection("scripts").doc(scriptId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.update({ audioUrl });
      }
    } catch (e) {
      console.warn("Script document not found in Firestore, skipping update.");
    }

    console.log(`✅ Voiceover generated successfully using Google TTS!`);

    return NextResponse.json({ success: true, audioUrl });
  } catch (error: any) {
    console.error("Audio Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
