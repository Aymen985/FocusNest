import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const { docId, count = 10 } = await req.json();

    let chunks: string[] = [];
    if (docId) {
      const snap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("documents")
        .doc(docId)
        .collection("chunks")
        .limit(30)
        .get();
      chunks = snap.docs.map((d) => d.data().text as string);
    } else {
      const docsSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("documents")
        .limit(5)
        .get();

      for (const docDoc of docsSnap.docs) {
        const chunksSnap = await docDoc.ref
          .collection("chunks")
          .limit(10)
          .get();
        chunksSnap.docs.forEach((c) => chunks.push(c.data().text as string));
      }
    }

    if (!chunks.length) {
      return NextResponse.json(
        { error: "No document content found. Upload a document first." },
        { status: 400 }
      );
    }

    const context = chunks.slice(0, 20).join("\n\n").slice(0, 6000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are a study assistant that creates flashcards from document content.
Return ONLY a valid JSON array with no markdown, no code blocks, no preamble.
Each flashcard object must have exactly two string fields: "front" and "back".
"front" is a concise question or prompt (≤15 words).
"back" is a clear, complete answer (1-3 sentences).
Generate exactly ${count} flashcards.`,
        },
        {
          role: "user",
          content: `Create ${count} flashcards from this content:\n\n${context}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    let cards: { front: string; back: string }[] = [];

    try {
      cards = JSON.parse(raw);
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) cards = JSON.parse(match[0]);
    }

    const setRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("flashcardSets")
      .doc();

    await setRef.set({
      cards,
      docId: docId ?? null,
      createdAt: new Date(),
      count: cards.length,
    });

    return NextResponse.json({ id: setRef.id, cards });
  } catch (err: any) {
    console.error("[flashcards]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}