// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

function chunkText(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const PDFParser = (await import("pdf2json")).default;
    return new Promise((resolve, reject) => {
      const parser = new PDFParser();
      parser.on("pdfParser_dataReady", (data: any) => {
        const text = data.Pages.flatMap((page: any) =>
          page.Texts.map((t: any) => {
            try {
              return decodeURIComponent(t.R[0].T);
            } catch {
              return t.R[0].T;
            }
          })
        ).join(" ");
        resolve(text);
      });
      parser.on("pdfParser_dataError", reject);
      parser.parseBuffer(buffer);
    });
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const text = await extractText(file);
    const chunks = chunkText(text);

    const batch = adminDb.batch();
    const docRef = adminDb.collection("users").doc(uid).collection("documents").doc();

    batch.set(docRef, {
      name: file.name,
      uploadedAt: new Date().toISOString(),
      chunkCount: chunks.length,
    });

    chunks.forEach((chunk, i) => {
      const chunkRef = docRef.collection("chunks").doc(String(i));
      batch.set(chunkRef, { text: chunk, index: i });
    });

    await batch.commit();

    return NextResponse.json({ success: true, docId: docRef.id, chunks: chunks.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}