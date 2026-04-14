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
    // TF: how often the word appears in this chunk
    const tf = chunkWords.filter((w) => w === word).length / totalWords;

    // IDF: how rare the word is across all chunks
    const docsWithWord = allChunks.filter((c) =>
      c.toLowerCase().includes(word)
    ).length || 1;
    const idf = Math.log(allChunks.length / docsWithWord);

    return score + tf * idf;
  }, 0);
}

async function retrieveContext(uid: string, query: string): Promise<string> {
  const docsSnap = await adminDb
    .collection("users").doc(uid)
    .collection("documents")
    .orderBy("uploadedAt", "desc")
    .limit(5)
    .get();

  const allChunks: { text: string }[] = [];

  for (const doc of docsSnap.docs) {
    const chunksSnap = await doc.ref.collection("chunks").get();
    chunksSnap.forEach((c) => {
      allChunks.push({ text: c.data().text as string });
    });
  }

  const texts = allChunks.map((c) => c.text);

  return allChunks
    .map((c) => ({ text: c.text, score: tfidf(c.text, query, texts) }))
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

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
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