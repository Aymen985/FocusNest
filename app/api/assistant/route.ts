import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";



export const runtime = "nodejs";

export async function POST(req: Request) {
  if (process.env.USE_REAL_AI !== "true") {
    return NextResponse.json({ text: "Demo mode: AI disabled." });
  }

  const body = await req.json();
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: message,
  });

  return NextResponse.json({
    text: response.output_text || "No response",
  });
}
