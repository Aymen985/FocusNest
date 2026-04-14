// app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function scoreChunk(chunk: string, query: string): number {
  const words = query.toLowerCase().split(/\W+/).filter(Boolean);
  const lower = chunk.toLowerCase();
  return words.reduce((score, word) => score + (lower.includes(word) ? 1 : 0), 0);
}

async function retrieveContext(uid: string, query: string): Promise<string> {
  const docsSnap = await adminDb
    .collection("users").doc(uid)
    .collection("documents")
    .orderBy("uploadedAt", "desc")
    .limit(5)
    .get();

  const scored: { text: string; score: number }[] = [];

  for (const doc of docsSnap.docs) {
    const chunksSnap = await doc.ref.collection("chunks").get();
    chunksSnap.forEach((c) => {
      const text = c.data().text as string;
      scored.push({ text, score: scoreChunk(text, query) });
    });
  }

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((c) => c.text)
    .join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    const uid = token ? (await getAuth().verifyIdToken(token)).uid : null;

    const { message, history } = await req.json();

    const context = uid ? await retrieveContext(uid, message) : "";

    const systemPrompt = context
      ? `You are a helpful AI study assistant. Use the following document excerpts to help answer the student's question. If the excerpts aren't relevant, answer from general knowledge.\n\n--- DOCUMENT CONTEXT ---\n${context}\n--- END CONTEXT ---`
      : `You are a helpful AI study assistant. Help students understand concepts, create study plans, and explain topics clearly.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Assistant error" }, { status: 500 });
  }
}