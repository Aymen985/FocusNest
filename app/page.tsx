"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGuest } from "@/context/GuestContext";
import { usePomodoroContext } from "@/context/PomodoroContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Link from "next/link";

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(t: {
  page_dashboard_greeting_morning: string;
  page_dashboard_greeting_afternoon: string;
  page_dashboard_greeting_evening: string;
}) {
  const h = new Date().getHours();
  if (h < 12) return t.page_dashboard_greeting_morning;
  if (h < 18) return t.page_dashboard_greeting_afternoon;
  return t.page_dashboard_greeting_evening;
}

// ── Mini Pomodoro card ────────────────────────────────────────────────────────
function HomePomodoroCard() {
  const {
    phase, secondsLeft, isRunning, growthStage, focusProgress,
    currentTree, handleStart, handlePause, handleReset, handleSwitchPhase,
    breakMins,
  } = usePomodoroContext();

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const R    = 72;
  const CIRC = 2 * Math.PI * R;
  const progress = phase === "focus"
    ? focusProgress
    : isRunning ? 1 - secondsLeft / (breakMins * 60) : 0;
  const dash = CIRC * Math.min(Math.max(progress, 0), 1);

  const treeEmoji = currentTree
    ? ["🌱", "🌿", "🌲", "🌳", "🌳"][growthStage]
    : "🌱";

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Pomodoro</h2>
          <p className="text-xs text-neutral-500">Plant a tree. Stay focused.</p>
        </div>
        <Link href="/pomodoro"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>

      {/* Phase badge */}
      <div className="flex justify-center">
        <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full ${
          phase === "focus"
            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
        }`}>
          {phase === "focus" ? "FOCUS PHASE" : "BREAK PHASE"}
        </span>
      </div>

      {/* Timer ring */}
      <div className="flex justify-center">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={R} fill="none"
              stroke="#e5e7eb" className="dark:stroke-neutral-700" strokeWidth="8" />
            <circle cx="80" cy="80" r={R} fill="none"
              stroke={phase === "focus" ? "#10b981" : "#3b82f6"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              style={{ transition: "stroke-dasharray 0.5s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl">{treeEmoji}</span>
            <span className="text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {mins}:{secs}
            </span>
            <span className="text-[10px] text-neutral-500">
              {isRunning ? "Focusing..." : currentTree ? "Paused" : "Press Plant & Start"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        {!isRunning ? (
          <button onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {currentTree ? "Resume" : "Plant & Start"}
          </button>
        ) : (
          <button onClick={handlePause}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            Pause
          </button>
        )}
        <button onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 text-sm rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
        <button onClick={handleSwitchPhase}
          className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 text-sm rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {phase === "focus" ? "Break" : "Focus"}
        </button>
      </div>
    </div>
  );
}

// ── Mini Forest card ──────────────────────────────────────────────────────────
function HomeForestCard() {
  const { forestTrees } = usePomodoroContext();
  const completed = forestTrees.filter((t) => t.status !== "abandoned").slice(0, 6);
  const treeEmoji: Record<string, string> = {
    oak: "🌳", pine: "🌲", cherry: "🌸", cactus: "🌵", dead: "🪨",
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Focus Forest</h2>
          <p className="text-xs text-neutral-500">{completed.length} / 6 cycles completed today</p>
        </div>
        <Link href="/forest"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
          View Progress
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[48px] items-center">
        {completed.length === 0 ? (
          <p className="text-xs text-neutral-400">No trees yet &mdash; start a session!</p>
        ) : (
          completed.map((tree) => (
            <span key={tree.id} className="text-3xl" title={tree.label}>
              {treeEmoji[tree.treeType] ?? "🌳"}
            </span>
          ))
        )}
      </div>
      {completed.length > 0 && (
        <p className="text-xs text-neutral-500">Excellent work! Your forest is growing.</p>
      )}
    </div>
  );
}

// ── Mini Assistant card ───────────────────────────────────────────────────────
function HomeAssistantCard() {
  const { user } = useAuth();
  const [input,     setInput]     = useState("");
  const [messages,  setMessages]  = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [streaming, setStreaming] = useState(false);

  if (!user) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">AI Study Assistant</p>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">How can I help you study today?</h3>
        <p className="text-sm text-neutral-500 mb-6">Sign in to explain, plan, quiz, or get unstuck.</p>
        <Link href="/login"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
          Sign in to unlock
        </Link>
      </div>
    );
  }

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          useDocContext: true,
        }),
      });
      if (!res.body) throw new Error();
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      setMessages((p) => [...p, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setMessages((p) => {
          const u = [...p];
          u[u.length - 1] = { role: "assistant", content };
          return u;
        });
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setStreaming(false);
    }
  };

  const quickPrompts = ["Explain recursion", "Make a study plan", "Quiz me on OS concepts"];

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-full min-h-[480px]">
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          AI Study Assistant
        </p>
        {messages.length === 0 && (
          <>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              How can I help you study today?
            </h3>
            <p className="text-sm text-neutral-500">
              Explain, plan, quiz, or get unstuck. I&apos;ve got you.
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-emerald-500 text-white"
                : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
            }`}>
              <p className="whitespace-pre-wrap">
                {m.content}
                {m.role === "assistant" && streaming && i === messages.length - 1 && (
                  <span className="inline-block w-0.5 h-3.5 bg-neutral-400 ml-0.5 animate-pulse align-middle" />
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map((p) => (
              <button key={p} onClick={() => setInput(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            placeholder="Ask me anything about your studies..."
            className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="w-7 h-7 rounded-lg bg-emerald-500 disabled:opacity-40 flex items-center justify-center hover:bg-emerald-600 transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-neutral-400 mt-1.5">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, loading, userProfile } = useAuth();
  const { isGuest, hasVisited } = useGuest();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user && !isGuest && hasVisited) router.push("/login");
  }, [user, loading, isGuest, hasVisited, router]);

  if (loading) return <LoadingScreen />;
  if (!user && !isGuest) return null;

  const firstName = userProfile?.firstName ?? user?.email?.split("@")[0] ?? "there";
  const greeting  = getGreeting(t);

  return (
    <div className="h-full flex flex-col gap-6 p-6 lg:p-8 bg-white dark:bg-neutral-950">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {greeting}, {firstName}!
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {isGuest ? (
            <>
              Browsing as guest.{" "}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 underline font-medium">
                Sign in
              </Link>{" "}
              for full access.
            </>
          ) : (
            "Ready to focus? Let's make it count."
          )}
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-6">
          <HomePomodoroCard />
          <HomeForestCard />
        </div>
        <HomeAssistantCard />
      </div>
    </div>
  );
}
