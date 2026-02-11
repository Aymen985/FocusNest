"use client";

import { useState } from "react";
import Link from "next/link";

type ChatMessage = { role: "user" | "ai"; text: string };

async function sendToAssistantAPI(message: string, history: ChatMessage[]) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      })),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Assistant request failed");

  return data as { text: string };
}

export default function AssistantWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  async function send() {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: userText },
    ];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const { text } = await sendToAssistantAPI(userText, nextMessages);
      setMessages((m) => [...m, { role: "ai", text }]);
    } catch {
      setError("AI unavailable. Please try again shortly.");
      setMessages((m) => [
        ...m,
        { role: "ai", text: "AI unavailable. Please try again shortly." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file.name);
  }

  return (
    <section
      style={{
        padding: "1.5rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>AI Study Assistant</h2>
        <Link href="/assistant" style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          Full view →
        </Link>
      </div>

      {/* Upload Button (Demo Only) */}
      <div style={{ marginTop: "0.75rem" }}>
        <label
          style={{
            display: "inline-block",
            padding: "0.4rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Upload Lecture / Exercise
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </label>

        {uploadedFile && (
          <div style={{ marginTop: "0.4rem", fontSize: "0.8rem", opacity: 0.8 }}>
            Uploaded (demo): {uploadedFile}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ opacity: 0.75 }}>
            Ask a question like: “Explain recursion like I’m 5” or “Make me a study plan for OS”.
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: "0.75rem",
                padding: "0.6rem 0.75rem",
                borderRadius: 12,
                background:
                  m.role === "user"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.2)",
              }}
            >
              <b style={{ opacity: 0.85 }}>
                {m.role === "user" ? "You" : "AI"}:
              </b>{" "}
              <span style={{ opacity: 0.9 }}>{m.text}</span>
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ opacity: 0.7, marginTop: "0.5rem" }}>
            <b>AI:</b> Thinking…
          </div>
        )}

        {error && (
          <div style={{ color: "crimson", marginTop: "0.5rem" }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Type your question…"
          style={{
            flex: 1,
            padding: "0.6rem 0.75rem",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
          disabled={isLoading}
        />
        <button
          onClick={send}
          disabled={isLoading || !input.trim()}
          style={{
            padding: "0.6rem 0.9rem",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {isLoading ? "Thinking…" : "Send"}
        </button>
      </div>
    </section>
  );
}
