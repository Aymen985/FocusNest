"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

type ChatMessage = { role: "user" | "ai"; text: string };

async function getToken() {
  return auth.currentUser?.getIdToken() ?? null;
}

async function uploadFile(file: File) {
  const token = await getToken();
  if (!token) throw new Error("Not logged in");
  const form  = new FormData();
  form.append("file", file);
  const res  = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data as { docId: string; chunks: number };
}

async function sendToAssistantAPI(
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void
) {
  const token = await getToken();
  const res   = await fetch("/api/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      })),
    }),
  });
  if (!res.ok) throw new Error("Assistant request failed");
  const reader  = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No response body");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export default function AssistantWidget() {
  const [input, setInput]               = useState("");
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function send() {
    if (!input.trim() || isLoading) return;
    const userText     = input.trim();
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: userText }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setMessages((m) => [...m, { role: "ai", text: "" }]);

    try {
      await sendToAssistantAPI(userText, nextMessages, (chunk) => {
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "ai", text: updated[updated.length - 1].text + chunk };
          return updated;
        });
      });
    } catch {
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = { role: "ai", text: "AI unavailable. Please try again shortly." };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus(`Uploading ${file.name}…`);
    try {
      const { chunks } = await uploadFile(file);
      setUploadStatus(`✓ ${file.name} — ${chunks} chunks indexed`);
      setMessages((m) => [
        ...m,
        { role: "ai", text: `I've indexed "${file.name}" (${chunks} chunks). Ask me anything about it!` },
      ]);
    } catch (err) {
      setUploadStatus(`Upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col min-h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-100">AI Study Assistant</h2>
        <div className="flex items-center gap-4">
          <Link href="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            My docs →
          </Link>
          <Link href="/assistant" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Full view →
          </Link>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-3">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500 cursor-pointer transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload lecture / exercise
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
        {uploadStatus && (
          <p className={`text-xs mt-1.5 ${uploadStatus.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
            {uploadStatus}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-3 overflow-y-auto space-y-2 mb-3 min-h-[160px]">
        {messages.length === 0 ? (
          <p className="text-xs text-neutral-600 leading-relaxed">
            Ask a question like: "Explain recursion like I'm 5" or "Make me a study plan for OS".
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "ai" && (
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-indigo-400">AI</span>
                </div>
              )}
              <div
                className={`max-w-[80%] text-xs rounded-xl px-3 py-2 leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-sm"
                    : "bg-neutral-800 text-neutral-300 rounded-bl-sm border border-neutral-700"
                }`}
              >
                {m.text}
                {m.role === "ai" && isLoading && i === messages.length - 1 && (
                  <span className="inline-block w-0.5 h-3 bg-neutral-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your question… (Shift+Enter for new line)"
          rows={2}
          disabled={isLoading}
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={isLoading || !input.trim()}
          className="px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors self-end py-2"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
