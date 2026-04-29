// app/api/assistant/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function tfidf(chunk: string, query: string, allChunks: string[]): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(Boolean);
  const chunkLower = chunk.toLowerCase();
  const chunkWords = chunkLower.split(/\W+/).filter(Boolean);
  const totalWords = chunkWords.length || 1;

  return queryWords.reduce((score, word) => {
    const tf = chunkWords.filter((w) => w === word).length / totalWords;
    const docsWithWord =
      allChunks.filter((c) => c.toLowerCase().includes(word)).length || 1;
    const idf = Math.log(allChunks.length / docsWithWord);
    return score + tf * idf;
  }, 0);
}

async function retrieveContext(
  uid: string,
  query: string,
  docId?: string
): Promise<string> {
  const allChunks: { text: string }[] = [];

  if (docId) {
    // Target the specific just-uploaded document
    const chunksSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("documents")
      .doc(docId)
      .collection("chunks")
      .get();
    chunksSnap.forEach((c) => allChunks.push({ text: c.data().text as string }));
  } else {
    // Fall back to recent documents
    const docsSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("documents")
      .orderBy("uploadedAt", "desc")
      .limit(5)
      .get();

    for (const doc of docsSnap.docs) {
      const chunksSnap = await doc.ref.collection("chunks").get();
      chunksSnap.forEach((c) =>
        allChunks.push({ text: c.data().text as string })
      );
    }
  }

  if (!allChunks.length) return "";

  const texts = allChunks.map((c) => c.text);

  const ranked = allChunks
    .map((c) => ({ text: c.text, score: tfidf(c.text, query, texts) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // If TF-IDF finds nothing relevant, return the first few chunks anyway
  const toReturn = ranked.length > 0 ? ranked : allChunks.slice(0, 5);
  return toReturn.map((c) => c.text).join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    const uid = token ? (await getAuth().verifyIdToken(token)).uid : null;

    const { message, history, docId } = await req.json();

    const context = uid ? await retrieveContext(uid, message, docId) : "";

    const systemPrompt = context
      ? `You are a helpful AI study assistant. The student has uploaded a document. Use the following excerpts from that document to answer their question accurately and specifically. Quote or reference the document content directly where helpful.\n\n--- DOCUMENT CONTEXT ---\n${context}\n--- END CONTEXT ---`
      : `You are a helpful AI study assistant. Help students understand concepts, create study plans, and explain topics clearly.`;

    // Strip "File attached" UI notification messages before sending to OpenAI —
    // these are cosmetic only and confuse the model about its own capabilities.
    const cleanHistory = (
      history as { role: "user" | "assistant" | "system"; content: string }[]
    ).filter(
      (m) =>
        !(m.role === "assistant" && m.content.startsWith("File attached:"))
    );

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...cleanHistory,
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Assistant error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
