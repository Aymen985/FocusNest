"use client";

import { useState } from "react";
import Link from "next/link";

export default function AssistantWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);

  function send() {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");

    // Placeholder “AI” response for now (we’ll replace with real API later)
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `Got it. I’ll help you study: "${userText}". (AI integration coming next.)`,
        },
      ]);
    }, 350);
  }

  return (
    <section
      style={{
        padding: "1.25rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        minHeight: 420,
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
                background: m.role === "user" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.2)",
              }}
            >
              <b style={{ opacity: 0.85 }}>{m.role === "user" ? "You" : "AI"}:</b>{" "}
              <span style={{ opacity: 0.9 }}>{m.text}</span>
            </div>
          ))
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
        />
        <button
          onClick={send}
          style={{ padding: "0.6rem 0.9rem", borderRadius: 10, cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
