"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { usePomodoroContext, type GrowthStage, type TreeType, type ForestTree } from "@/context/PomodoroContext";
import { useLanguage } from "@/context/LanguageContext";
import LoadingScreen from "@/components/LoadingScreen";
import Link from "next/link";

// Greeting helper 
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

//  SVG Mini Trees (same design as pomodoro page) 
function MiniOak({ dead }: { dead?: boolean }) {
  return (
    <svg viewBox="0 0 60 72" className="w-full h-full">
      <ellipse cx="30" cy="66" rx="18" ry="4" fill={dead ? "#52525b" : "#5c3d1e"} opacity="0.3"/>
      <rect x="27" y="38" width="6" height="28" rx="3" fill={dead ? "#52525b" : "#7c4f28"}/>
      <ellipse cx="30" cy="28" rx="18" ry="16" fill={dead ? "#3f3f46" : "#15803d"}/>
      <ellipse cx="18" cy="34" rx="13" ry="10" fill={dead ? "#27272a" : "#166534"}/>
      <ellipse cx="42" cy="34" rx="13" ry="10" fill={dead ? "#27272a" : "#166534"}/>
      <ellipse cx="30" cy="22" rx="14" ry="12" fill={dead ? "#52525b" : "#22c55e"}/>
    </svg>
  );
}
function MiniPine({ dead }: { dead?: boolean }) {
  return (
    <svg viewBox="0 0 60 72" className="w-full h-full">
      <ellipse cx="30" cy="66" rx="14" ry="3" fill={dead ? "#52525b" : "#5c3d1e"} opacity="0.3"/>
      <rect x="27" y="50" width="6" height="16" rx="3" fill={dead ? "#52525b" : "#7c4f28"}/>
      <polygon points="30,8 14,50 46,50" fill={dead ? "#27272a" : "#15803d"}/>
      <polygon points="30,18 16,44 44,44" fill={dead ? "#3f3f46" : "#16a34a"}/>
      <polygon points="30,28 18,40 42,40" fill={dead ? "#52525b" : "#22c55e"}/>
      <polygon points="30,8 18,28 42,28" fill={dead ? "#71717a" : "#4ade80"}/>
    </svg>
  );
}
function MiniCherry({ dead }: { dead?: boolean }) {
  return (
    <svg viewBox="0 0 60 72" className="w-full h-full">
      <ellipse cx="30" cy="66" rx="16" ry="4" fill={dead ? "#52525b" : "#5c3d1e"} opacity="0.3"/>
      <path d="M30,65 Q28,50 30,38" stroke={dead ? "#52525b" : "#92400e"} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="18" cy="28" r="12" fill={dead ? "#3f3f46" : "#fbcfe8"}/>
      <circle cx="42" cy="28" r="12" fill={dead ? "#3f3f46" : "#fbcfe8"}/>
      <circle cx="30" cy="22" r="14" fill={dead ? "#52525b" : "#fce7f3"}/>
      {!dead && <><circle cx="22" cy="20" r="2" fill="#fda4af"/><circle cx="36" cy="24" r="2" fill="#fda4af"/><circle cx="30" cy="14" r="2" fill="#fda4af"/></>}
    </svg>
  );
}
function MiniCactus({ dead }: { dead?: boolean }) {
  return (
    <svg viewBox="0 0 60 72" className="w-full h-full">
      <ellipse cx="30" cy="66" rx="14" ry="3" fill={dead ? "#52525b" : "#92400e"} opacity="0.3"/>
      <rect x="26" y="24" width="8" height="42" rx="4" fill={dead ? "#52525b" : "#65a30d"}/>
      <rect x="34" y="34" width="12" height="6" rx="3" fill={dead ? "#52525b" : "#65a30d"}/>
      <rect x="38" y="28" width="6" height="14" rx="3" fill={dead ? "#52525b" : "#65a30d"}/>
      <rect x="14" y="40" width="12" height="6" rx="3" fill={dead ? "#52525b" : "#65a30d"}/>
      <rect x="16" y="32" width="6" height="16" rx="3" fill={dead ? "#52525b" : "#65a30d"}/>
      <ellipse cx="30" cy="22" rx="6" ry="7" fill={dead ? "#3f3f46" : "#65a30d"}/>
      {!dead && <circle cx="30" cy="16" r="4" fill="#fbbf24"/>}
    </svg>
  );
}
function MiniDead() {
  return (
    <svg viewBox="0 0 60 72" className="w-full h-full">
      <ellipse cx="30" cy="66" rx="14" ry="3" fill="#52525b" opacity="0.25"/>
      <rect x="27" y="36" width="6" height="30" rx="3" fill="#52525b"/>
      <line x1="30" y1="44" x2="15" y2="32" stroke="#52525b" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="44" x2="45" y2="34" stroke="#52525b" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="52" x2="18" y2="42" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30" y1="52" x2="42" y2="44" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="15" y1="32" x2="9" y2="22" stroke="#52525b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="45" y1="34" x2="51" y2="24" stroke="#52525b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function TreeIcon({ treeType, dead }: { treeType: string; dead?: boolean }) {
  if (dead || treeType === "dead") return <MiniDead />;
  switch (treeType) {
    case "pine":   return <MiniPine />;
    case "cherry": return <MiniCherry />;
    case "cactus": return <MiniCactus />;
    default:       return <MiniOak />;
  }
}

// Growing tree inside the timer ring (stage 0-4 same as pomodoro page)
function GrowingOak({ stage }: { stage: GrowthStage }) {
  const s = stage;
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="38" ry="7" fill="#5c3d1e" opacity="0.35"/>
      {s >= 1 && <rect x="55" y={s === 1 ? 100 : s === 2 ? 90 : s === 3 ? 78 : 72} width={s <= 2 ? 10 : 12} height={s === 1 ? 32 : s === 2 ? 42 : s === 3 ? 54 : 60} rx="5" fill="#7c4f28"/>}
      {s === 0 && <ellipse cx="60" cy="118" rx="9" ry="12" fill="#8B6914" className="animate-pulse"/>}
      {s === 1 && <><ellipse cx="60" cy="95" rx="14" ry="12" fill="#4ade80"/><ellipse cx="48" cy="100" rx="10" ry="8" fill="#22c55e"/><ellipse cx="72" cy="100" rx="10" ry="8" fill="#22c55e"/></>}
      {s === 2 && <><ellipse cx="60" cy="82" rx="22" ry="18" fill="#22c55e"/><ellipse cx="44" cy="90" rx="16" ry="13" fill="#16a34a"/><ellipse cx="76" cy="90" rx="16" ry="13" fill="#16a34a"/><ellipse cx="60" cy="78" rx="18" ry="14" fill="#4ade80"/></>}
      {s === 3 && <><ellipse cx="60" cy="68" rx="30" ry="26" fill="#16a34a"/><ellipse cx="38" cy="80" rx="22" ry="18" fill="#15803d"/><ellipse cx="82" cy="80" rx="22" ry="18" fill="#15803d"/><ellipse cx="60" cy="62" rx="26" ry="22" fill="#22c55e"/></>}
      {s === 4 && <><ellipse cx="60" cy="58" rx="38" ry="32" fill="#15803d"/><ellipse cx="32" cy="72" rx="28" ry="22" fill="#166534"/><ellipse cx="88" cy="72" rx="28" ry="22" fill="#166534"/><ellipse cx="60" cy="50" rx="32" ry="28" fill="#22c55e"/><ellipse cx="60" cy="44" rx="24" ry="20" fill="#86efac"/></>}
    </svg>
  );
}

//  Mini Pomodoro card 
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

      {/* Timer ring with SVG tree inside */}
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
            {/* Forest card */}
            <div className="w-10 h-10">
              {phase === "focus" ? (
                <GrowingOak stage={growthStage} />
              ) : (
                <svg viewBox="0 0 60 60" className="w-full h-full">
                  <text x="30" y="40" textAnchor="middle" fontSize="36">&#127769;</text>
                </svg>
              )}
            </div>
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

// Forest card
function HomeForestCard() {
  const { forestTrees, loadingForest } = usePomodoroContext();
  const recent = forestTrees.slice(0, 6);

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Focus Forest</h2>
          <p className="text-xs text-neutral-500">
            {recent.filter((t) => t.status !== "abandoned").length} / 6 cycles completed today
          </p>
        </div>
        <Link href="/forest" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
          View Progress
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[48px] items-center">
        {loadingForest ? (
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        ) : recent.length === 0 ? (
          <p className="text-xs text-neutral-400">No trees yet &mdash; start a session!</p>
        ) : (
          recent.map((tree) => {
            const isDead = tree.status === "abandoned" || tree.completed === false || tree.treeType === "dead";
            return (
              <div key={tree.id} className={`w-10 h-10 shrink-0 ${isDead ? "opacity-40 grayscale" : ""}`} title={tree.label || tree.treeType}>
                <TreeIcon treeType={tree.treeType} dead={isDead} />
              </div>
            );
          })
        )}
      </div>
      {recent.filter((t) => t.status !== "abandoned").length > 0 && (
        <p className="text-xs text-neutral-500">Excellent work! Your forest is growing.</p>
      )}
    </div>
  );
}

//  Mini Assistant card 
function HomeAssistantCard() {
  const { user } = useAuth();
  const [input,     setInput]     = useState("");
  const [messages,  setMessages]  = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [mounted,   setMounted]   = useState(false);
  const [streaming, setStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("focusnest_chat_history");
      if (stored) setMessages(JSON.parse(stored));
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("focusnest_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages, mounted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    e.target.value = "";
  };

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
      setAttachedFile(null);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setStreaming(false);
    }
  };

  const quickPrompts = ["Explain recursion", "Make a study plan", "Quiz me on OS concepts"];

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-full min-h-[480px]">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

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

      {/* Attached file indicator */}
      {attachedFile && (
        <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="truncate">{attachedFile.name}</span>
          <button onClick={() => setAttachedFile(null)} className="ml-auto shrink-0 hover:text-red-500 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2">
          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach a document"
            className="w-6 h-6 flex items-center justify-center shrink-0 text-neutral-400 hover:text-emerald-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
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
          Enter to send &middot; paperclip to attach a file
        </p>
      </div>
    </div>
  );
}

//  Page 
export default function HomePage() {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

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
          Ready to focus? Let&apos;s make it count.
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
