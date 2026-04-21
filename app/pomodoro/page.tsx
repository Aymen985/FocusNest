"use client";
import { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useLanguage } from "@/context/LanguageContext";
import {
  usePomodoroContext,
  clampInt,
  type TreeType,
  type GrowthStage,
  type ForestTree,
  type Phase,
} from "@/context/PomodoroContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const t = Math.max(0, Math.floor(s));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

const STAGE_LABELS = ["Seed", "Sprout", "Sapling", "Young tree", "Full tree"];

const TREE_LABELS: Record<TreeType, string> = {
  oak: "Oak", pine: "Pine", cherry: "Cherry Blossom", cactus: "Cactus",
};

const TREE_COLORS: Record<TreeType, string> = {
  oak:    "text-green-500",
  pine:   "text-emerald-400",
  cherry: "text-pink-400",
  cactus: "text-lime-500",
};

// ─── SVG Trees ────────────────────────────────────────────────────────────────

function OakTree({ stage }: { stage: GrowthStage }) {
  const s = stage;
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="38" ry="7" fill="#5c3d1e" opacity="0.35" />
      {s >= 1 && (
        <rect x="55" y={s === 1 ? 100 : s === 2 ? 90 : s === 3 ? 78 : 72}
          width={s <= 2 ? 10 : 12} height={s === 1 ? 32 : s === 2 ? 42 : s === 3 ? 54 : 60}
          rx="5" fill="#7c4f28" />
      )}
      {s === 0 && <ellipse cx="60" cy="118" rx="9" ry="12" fill="#8B6914" className="animate-pulse" />}
      {s === 1 && (<>
        <ellipse cx="60" cy="95" rx="14" ry="12" fill="#4ade80" />
        <ellipse cx="48" cy="100" rx="10" ry="8" fill="#22c55e" />
        <ellipse cx="72" cy="100" rx="10" ry="8" fill="#22c55e" />
      </>)}
      {s === 2 && (<>
        <ellipse cx="60" cy="82" rx="22" ry="18" fill="#22c55e" />
        <ellipse cx="44" cy="90" rx="16" ry="13" fill="#16a34a" />
        <ellipse cx="76" cy="90" rx="16" ry="13" fill="#16a34a" />
        <ellipse cx="60" cy="78" rx="18" ry="14" fill="#4ade80" />
      </>)}
      {s === 3 && (<>
        <ellipse cx="60" cy="68" rx="30" ry="26" fill="#16a34a" />
        <ellipse cx="38" cy="80" rx="22" ry="18" fill="#15803d" />
        <ellipse cx="82" cy="80" rx="22" ry="18" fill="#15803d" />
        <ellipse cx="60" cy="62" rx="26" ry="22" fill="#22c55e" />
        <ellipse cx="42" cy="68" rx="18" ry="14" fill="#4ade80" />
        <ellipse cx="78" cy="68" rx="18" ry="14" fill="#4ade80" />
      </>)}
      {s === 4 && (<>
        <ellipse cx="60" cy="58" rx="38" ry="32" fill="#15803d" />
        <ellipse cx="32" cy="72" rx="28" ry="22" fill="#166534" />
        <ellipse cx="88" cy="72" rx="28" ry="22" fill="#166534" />
        <ellipse cx="60" cy="50" rx="32" ry="28" fill="#22c55e" />
        <ellipse cx="36" cy="60" rx="22" ry="18" fill="#4ade80" />
        <ellipse cx="84" cy="60" rx="22" ry="18" fill="#4ade80" />
        <ellipse cx="60" cy="44" rx="24" ry="20" fill="#86efac" />
        <circle cx="44" cy="82" r="4" fill="#854d0e" />
        <circle cx="76" cy="78" r="4" fill="#854d0e" />
        <circle cx="60" cy="85" r="3.5" fill="#854d0e" />
      </>)}
    </svg>
  );
}

function PineTree({ stage }: { stage: GrowthStage }) {
  const s = stage;
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="32" ry="6" fill="#5c3d1e" opacity="0.35" />
      {s === 0 && <ellipse cx="60" cy="118" rx="9" ry="12" fill="#8B6914" className="animate-pulse" />}
      {s >= 1 && <rect x="56" y={s <= 2 ? 104 : s === 3 ? 96 : 88} width="8"
        height={s <= 2 ? 28 : s === 3 ? 36 : 44} rx="4" fill="#7c4f28" />}
      {s === 1 && <polygon points="60,72 44,105 76,105" fill="#22c55e" />}
      {s === 2 && (<>
        <polygon points="60,58 38,100 82,100" fill="#16a34a" />
        <polygon points="60,50 42,82 78,82" fill="#22c55e" />
      </>)}
      {s === 3 && (<>
        <polygon points="60,82 38,108 82,108" fill="#15803d" />
        <polygon points="60,62 36,94 84,94" fill="#16a34a" />
        <polygon points="60,44 40,72 80,72" fill="#22c55e" />
        <polygon points="60,30 44,56 76,56" fill="#4ade80" />
      </>)}
      {s === 4 && (<>
        <polygon points="60,88 34,118 86,118" fill="#14532d" />
        <polygon points="60,68 32,102 88,102" fill="#15803d" />
        <polygon points="60,50 34,82 86,82" fill="#16a34a" />
        <polygon points="60,34 36,64 84,64" fill="#22c55e" />
        <polygon points="60,18 40,46 80,46" fill="#4ade80" />
        <polygon points="60,6 46,28 74,28" fill="#86efac" />
        <polygon points="60,6 46,22 74,22" fill="white" opacity="0.6" />
        <polygon points="60,18 40,36 80,36" fill="white" opacity="0.3" />
      </>)}
    </svg>
  );
}

function CherryTree({ stage }: { stage: GrowthStage }) {
  const s = stage;
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="35" ry="7" fill="#5c3d1e" opacity="0.35" />
      {s === 0 && <ellipse cx="60" cy="118" rx="8" ry="11" fill="#fda4af" className="animate-pulse" />}
      {s >= 1 && (<>
        <path d={s <= 2 ? "M60,130 Q58,110 60,100"
            : s === 3 ? "M60,130 Q55,108 58,90 Q56,80 60,70"
            : "M60,130 Q54,108 56,88 Q52,72 58,58"}
          stroke="#92400e" strokeWidth={s <= 2 ? 7 : s === 3 ? 9 : 11}
          fill="none" strokeLinecap="round" />
        {s >= 3 && (<>
          <path d="M58,88 Q44,80 36,72" stroke="#92400e" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M58,88 Q72,80 80,72" stroke="#92400e" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>)}
        {s === 4 && (<>
          <path d="M57,72 Q44,62 38,52" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M57,72 Q70,62 76,52" stroke="#92400e" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>)}
      </>)}
      {s === 1 && (<>
        <circle cx="60" cy="92" r="14" fill="#fbcfe8" />
        <circle cx="50" cy="98" r="10" fill="#f9a8d4" />
        <circle cx="70" cy="98" r="10" fill="#f9a8d4" />
      </>)}
      {s === 2 && (<>
        <circle cx="60" cy="80" r="20" fill="#f9a8d4" />
        <circle cx="44" cy="88" r="15" fill="#fbcfe8" />
        <circle cx="76" cy="88" r="15" fill="#fbcfe8" />
        <circle cx="60" cy="74" r="16" fill="#fce7f3" />
      </>)}
      {s === 3 && (<>
        <circle cx="36" cy="68" r="18" fill="#f9a8d4" />
        <circle cx="84" cy="68" r="18" fill="#f9a8d4" />
        <circle cx="60" cy="60" r="20" fill="#fbcfe8" />
        <circle cx="40" cy="78" r="14" fill="#fce7f3" />
        <circle cx="80" cy="78" r="14" fill="#fce7f3" />
        {[[36,58],[50,52],[70,52],[84,58],[44,68],[76,68]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#fda4af" opacity="0.9" />
        ))}
      </>)}
      {s === 4 && (<>
        <circle cx="34" cy="58" r="22" fill="#f9a8d4" />
        <circle cx="86" cy="58" r="22" fill="#f9a8d4" />
        <circle cx="60" cy="46" r="26" fill="#fbcfe8" />
        <circle cx="36" cy="72" r="18" fill="#fce7f3" />
        <circle cx="84" cy="72" r="18" fill="#fce7f3" />
        <circle cx="60" cy="38" r="18" fill="#fef9ff" />
        {[[28,88],[44,94],[68,92],[82,86],[52,100],[72,98],[36,100],[90,94]].map(([x,y],i) => (
          <ellipse key={i} cx={x} cy={y} rx="4" ry="6" fill="#fda4af"
            opacity={0.4 + (i % 3) * 0.2} transform={`rotate(${i * 25},${x},${y})`} />
        ))}
        {[[34,46],[50,36],[70,36],[86,46],[42,60],[78,60],[60,30]].map(([x,y],i) => (
          <g key={i}>
            {[0,72,144,216,288].map((deg, j) => (
              <ellipse key={j} cx={x + 5 * Math.cos(deg * Math.PI / 180)}
                cy={y + 5 * Math.sin(deg * Math.PI / 180)}
                rx="3" ry="2" fill="#fda4af"
                transform={`rotate(${deg},${x + 5 * Math.cos(deg * Math.PI / 180)},${y + 5 * Math.sin(deg * Math.PI / 180)})`} />
            ))}
            <circle cx={x} cy={y} r="2" fill="#fbbf24" />
          </g>
        ))}
      </>)}
    </svg>
  );
}

function CactusTree({ stage }: { stage: GrowthStage }) {
  const s = stage;
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="30" ry="6" fill="#92400e" opacity="0.3" />
      <ellipse cx="60" cy="130" rx="28" ry="5" fill="#d97706" opacity="0.2" />
      {s === 0 && <ellipse cx="60" cy="118" rx="7" ry="10" fill="#65a30d" className="animate-pulse" />}
      {s >= 1 && <rect x="54" y={s === 1 ? 100 : s === 2 ? 88 : s === 3 ? 76 : 68}
        width="12" height={s === 1 ? 30 : s === 2 ? 42 : s === 3 ? 54 : 62} rx="6" fill="#65a30d" />}
      {s >= 2 && [0,1,2,3].map(i => (
        <line key={i} x1="57" y1={90 + i * 12} x2="63" y2={90 + i * 12}
          stroke="#4d7c0f" strokeWidth="1.5" opacity="0.6" />
      ))}
      {s === 1 && <ellipse cx="60" cy="98" rx="9" ry="10" fill="#65a30d" />}
      {s === 2 && (<>
        <ellipse cx="60" cy="82" rx="8" ry="9" fill="#65a30d" />
        <rect x="66" y="88" width="18" height="10" rx="5" fill="#65a30d" />
        <rect x="76" y="78" width="10" height="20" rx="5" fill="#65a30d" />
        {[[68,84],[74,90],[80,82]].map(([x,y],i) => (
          <line key={i} x1={x} y1={y} x2={x+4} y2={y-4} stroke="#d4d4d4" strokeWidth="1.5" />
        ))}
      </>)}
      {s === 3 && (<>
        <ellipse cx="60" cy="70" rx="9" ry="10" fill="#65a30d" />
        <rect x="66" y="76" width="20" height="10" rx="5" fill="#65a30d" />
        <rect x="78" y="62" width="10" height="24" rx="5" fill="#65a30d" />
        <rect x="34" y="84" width="20" height="10" rx="5" fill="#65a30d" />
        <rect x="32" y="70" width="10" height="24" rx="5" fill="#65a30d" />
        {[[68,78],[76,84],[82,68],[38,86],[44,82],[36,74]].map(([x,y],i) => (
          <line key={i} x1={x} y1={y} x2={x+(i%2===0?4:-4)} y2={y-4} stroke="#d4d4d4" strokeWidth="1.5" />
        ))}
      </>)}
      {s === 4 && (<>
        <ellipse cx="60" cy="62" rx="10" ry="11" fill="#65a30d" />
        <rect x="68" y="68" width="22" height="11" rx="5.5" fill="#65a30d" />
        <rect x="80" y="52" width="11" height="28" rx="5.5" fill="#65a30d" />
        <ellipse cx="86" cy="50" rx="8" ry="9" fill="#65a30d" />
        <rect x="30" y="76" width="22" height="11" rx="5.5" fill="#65a30d" />
        <rect x="29" y="60" width="11" height="28" rx="5.5" fill="#65a30d" />
        <ellipse cx="34" cy="58" rx="8" ry="9" fill="#65a30d" />
        {[[70,70],[78,76],[84,62],[86,56],[34,62],[34,68],[38,78],[44,82]].map(([x,y],i) => (
          <line key={i} x1={x} y1={y} x2={x+(i%2===0?5:-5)} y2={y-5} stroke="#e5e7eb" strokeWidth="1.5" />
        ))}
        {[0,60,120,180,240,300].map((deg, i) => (
          <ellipse key={i} cx={60 + 9 * Math.cos(deg * Math.PI / 180)}
            cy={52 + 9 * Math.sin(deg * Math.PI / 180)} rx="5" ry="3" fill="#f43f5e"
            transform={`rotate(${deg},${60 + 9 * Math.cos(deg * Math.PI / 180)},${52 + 9 * Math.sin(deg * Math.PI / 180)})`} />
        ))}
        <circle cx="60" cy="52" r="5" fill="#fbbf24" />
        {[0,60,120,180,240,300].map((deg, i) => (
          <ellipse key={i} cx={86 + 7 * Math.cos(deg * Math.PI / 180)}
            cy={42 + 7 * Math.sin(deg * Math.PI / 180)} rx="4" ry="2.5" fill="#fb923c"
            transform={`rotate(${deg},${86 + 7 * Math.cos(deg * Math.PI / 180)},${42 + 7 * Math.sin(deg * Math.PI / 180)})`} />
        ))}
        <circle cx="86" cy="42" r="4" fill="#fbbf24" />
      </>)}
    </svg>
  );
}


function DeadTree() {
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" style={{ overflow: "visible" }}>
      <ellipse cx="60" cy="132" rx="28" ry="5" fill="#52525b" opacity="0.25" />
      {/* Bare trunk */}
      <rect x="54" y="72" width="12" height="60" rx="6" fill="#52525b" />
      {/* Bare branches */}
      <line x1="60" y1="88" x2="30" y2="66" stroke="#52525b" strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="88" x2="90" y2="70" stroke="#52525b" strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="100" x2="36" y2="84" stroke="#52525b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="100" x2="84" y2="88" stroke="#52525b" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="66" x2="18" y2="52" stroke="#52525b" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="66" x2="26" y2="50" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="90" y1="70" x2="102" y2="56" stroke="#52525b" strokeWidth="3" strokeLinecap="round" />
      <line x1="90" y1="70" x2="94" y2="52" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Fallen leaves on ground */}
      <ellipse cx="28" cy="128" rx="5" ry="3" fill="#78716c" opacity="0.5" transform="rotate(-20,28,128)" />
      <ellipse cx="90" cy="130" rx="4" ry="2.5" fill="#78716c" opacity="0.4" transform="rotate(15,90,130)" />
      <ellipse cx="50" cy="131" rx="4" ry="2" fill="#78716c" opacity="0.35" transform="rotate(-10,50,131)" />
    </svg>
  );
}

function TreeRenderer({ type, stage }: { type: TreeType; stage: GrowthStage }) {
  switch (type) {
    case "oak":    return <OakTree stage={stage} />;
    case "pine":   return <PineTree stage={stage} />;
    case "cherry": return <CherryTree stage={stage} />;
    case "cactus": return <CactusTree stage={stage} />;
  }
}

function ForestMiniTree({ tree }: { tree: ForestTree }) {
  const isDead = (tree as any).status === "abandoned" || (tree as any).completed === false || tree.treeType === "dead";
  return (
    <div className="flex flex-col items-center gap-1 group" title={isDead ? "Abandoned session" : tree.treeType}>
      <div className={`w-14 h-14 transition-transform group-hover:scale-110 ${isDead ? "opacity-50 grayscale" : ""}`}>
        {isDead ? <DeadTree /> : <TreeRenderer type={tree.treeType as import("@/context/PomodoroContext").TreeType} stage={4} />}
      </div>
      <p className="text-[9px] text-neutral-500 dark:text-neutral-600 text-center leading-tight">
        {new Date(tree.completedAt.seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </p>
    </div>
  );
}

function ProgressRing({ progress, phase }: { progress: number; phase: Phase }) {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const color = phase === "focus" ? "#10b981" : "#10b981";
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="6"
        className="text-neutral-100 dark:text-neutral-800" />
      <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        style={{ transition: "stroke-dashoffset 1s linear" }} />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PomodoroInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const {
    focusMins, breakMins, label,
    setFocusMins, setBreakMins, setLabel,
    phase, secondsLeft, isRunning, elapsed,
    currentTree, growthStage, focusProgress,
    forestTrees, loadingForest, setForestTrees,
    showCelebration,
    handleStart, handlePause, handleReset, handleSwitchPhase,
  } = usePomodoroContext();
  const { t } = useLanguage();

  // Pre-fill from timetable query params (only on first mount if timer not running)
  useEffect(() => {
    const paramLabel    = searchParams.get("label");
    const paramDuration = searchParams.get("duration");
    if (paramLabel && !isRunning)    setLabel(paramLabel);
    if (paramDuration && !isRunning) setFocusMins(clampInt(Number(paramDuration), 1, 180));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load forest on mount (only if empty)
  useEffect(() => {
    if (!user || forestTrees.length > 0) return;
    (async () => {
      try {
        const { getDocs: gd, query: q, collection: col, orderBy: ob, limit: lim } =
          await import("firebase/firestore");
        const snap = await gd(q(col(db, "users", user.uid, "pomodoroSessions"), ob("completedAt", "desc"), lim(50)));
        setForestTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as ForestTree)));
      } catch (e) { console.error(e); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Tab title ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const time = formatTime(secondsLeft);
    const label = phase === "focus" ? "Focus" : "Break";
    document.title = isRunning || secondsLeft > 0
      ? `${time} · ${label} — FocusNest`
      : "FocusNest — Pomodoro";
    return () => { document.title = "FocusNest — Study Smarter"; };
  }, [secondsLeft, phase, isRunning]);

  const ringProgress = phase === "focus" ? focusProgress
    : 1 - secondsLeft / (clampInt(breakMins, 1, 60) * 60);
  const treeToShow = currentTree ?? "oak";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Pomodoro</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Plant a tree. Stay focused. Grow your forest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Timer card ─────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col items-center gap-6">

            <div className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest ${
              phase === "focus"
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-500"
                : "bg-emerald-50 dark:bg-emerald-950 text-emerald-500"
            }`}>
              {phase === "focus" ? t.page_pomodoro_focus + " phase" : t.page_pomodoro_break + " phase"}
            </div>

            <div className="relative w-56 h-56 flex items-center justify-center">
              <ProgressRing progress={ringProgress} phase={phase} />
              <div className="relative z-10 w-40 h-40 flex items-center justify-center">
                {phase === "focus" ? (
                  <div className={`w-full h-full ${showCelebration ? "animate-bounce" : ""}`}>
                    <TreeRenderer type={treeToShow} stage={growthStage} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl">🌙</span>
                    <p className="text-xs text-emerald-500 font-medium">Rest</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-6xl font-bold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-50">
                {formatTime(secondsLeft)}
              </p>
              {phase === "focus" && currentTree && (
                <p className={`text-sm font-medium mt-1 ${TREE_COLORS[treeToShow]}`}>
                  Growing a {TREE_LABELS[treeToShow]} — {STAGE_LABELS[growthStage]}
                </p>
              )}
              {phase === "focus" && !currentTree && (
                <p className="text-sm text-neutral-400 mt-1">Press Start to plant your tree</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {!isRunning ? (
                <button onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  {phase === "focus" ? (currentTree ? t.page_pomodoro_resume : t.page_pomodoro_plant) : t.page_pomodoro_resume}
                </button>
              ) : (
                <button onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  Pause
                </button>
              )}
              <button onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                Reset
              </button>
              <button onClick={handleSwitchPhase}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                {phase === "focus" ? "→ Break" : "→ Focus"}
              </button>
            </div>

            {showCelebration && (
              <div className="text-center animate-fade-in">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-semibold text-emerald-500">Tree planted! Added to your forest.</p>
              </div>
            )}
          </div>

          {/* ── Settings + Forest ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Settings</h2>
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">Session label</label>
                <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                  placeholder={t.ph_what_studying} disabled={isRunning}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">Focus (min)</label>
                  <input type="number" min={1} max={180} value={focusMins}
                    onChange={e => setFocusMins(clampInt(Number(e.target.value), 1, 180))}
                    disabled={isRunning}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">Break (min)</label>
                  <input type="number" min={1} max={60} value={breakMins}
                    onChange={e => setBreakMins(clampInt(Number(e.target.value), 1, 60))}
                    disabled={isRunning}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" />
                </div>
              </div>
              {phase === "focus" && elapsed > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>{STAGE_LABELS[growthStage]}</span>
                    <span>{Math.round(focusProgress * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${focusProgress * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">My Forest</h2>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {forestTrees.length} {forestTrees.length === 1 ? "tree" : "trees"}
                </span>
              </div>
              {loadingForest ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
              ) : forestTrees.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-3 opacity-30"><OakTree stage={0} /></div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-600">
                    Complete a focus session to plant your first tree.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto">
                  {forestTrees.map(tree => <ForestMiniTree key={tree.id} tree={tree} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
export default function PomodoroPage() {
  return (
    <Suspense fallback={null}>
      <PomodoroInner />
    </Suspense>
  );
}
