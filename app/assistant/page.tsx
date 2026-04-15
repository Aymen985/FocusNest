"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [docContext, setDocContext] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, useDocContext: docContext }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-neutral-50 dark:bg-neutral-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div>
          <h1 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Study Assistant
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Ask anything about your uploaded documents
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Doc context
          </span>
          <button
            type="button"
            onClick={() => setDocContext((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              docContext
                ? "bg-indigo-500"
                : "bg-neutral-300 dark:bg-neutral-700"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                docContext ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </label>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 font-medium mb-1">
              How can I help you study?
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-600 max-w-sm">
              Ask questions about your notes, get explanations, or quiz yourself
              on any topic.
            </p>
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                "Summarise my uploaded documents",
                "Quiz me on the main concepts",
                "Explain the key terms",
              ].map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); textareaRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <span className="text-indigo-500 text-xs font-bold">AI</span>
              </div>
            )}
            <div
              className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-md"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">
                {m.content}
                {m.role === "assistant" &&
                  streaming &&
                  i === messages.length - 1 && (
                    <span className="inline-block w-0.5 h-4 bg-neutral-400 ml-0.5 animate-pulse align-middle" />
                  )}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <form
          onSubmit={send}
          className="flex items-end gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents… (Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none py-1"
            style={{ maxHeight: 160 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="w-8 h-8 rounded-xl bg-indigo-500 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-opacity hover:bg-indigo-600"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-neutral-400 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
