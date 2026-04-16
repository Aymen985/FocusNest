"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { usePomodoroContext, type ForestTree } from "@/context/PomodoroContext";
import Link from "next/link";

// ─── Tree SVGs (mini versions) ────────────────────────────────────────────────

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

// ─── Floating island tile ─────────────────────────────────────────────────────

function IslandTile({ tree, index }: { tree: ForestTree; index: number }) {
  const isDead = tree.status === "abandoned" || tree.completed === false || tree.treeType === "dead";
  const date   = new Date(tree.completedAt.seconds * 1000);
  const label  = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div
      className="group relative flex flex-col items-center"
      style={{ animation: `tile-in 0.4s ease both`, animationDelay: `${index * 40}ms` }}
      title={`${isDead ? "Abandoned" : tree.treeType} — ${label}${tree.label ? ` · ${tree.label}` : ""}`}
    >
      {/* Island base */}
      <div className="relative">
        {/* Grass top */}
        <div className={`w-16 h-4 rounded-t-xl ${isDead ? "bg-neutral-600" : "bg-green-400"}`}
          style={{ clipPath: "ellipse(50% 100% at 50% 100%)" }} />
        {/* Dirt body */}
        <div className={`w-16 h-6 ${isDead ? "bg-neutral-700" : "bg-amber-800"} rounded-b-lg`}
          style={{ marginTop: -2 }}>
          {/* Dirt texture lines */}
          <div className="flex flex-col gap-1 pt-1 px-2 opacity-40">
            <div className={`h-px ${isDead ? "bg-neutral-500" : "bg-amber-900"} rounded`} />
            <div className={`h-px ${isDead ? "bg-neutral-500" : "bg-amber-900"} rounded w-3/4`} />
          </div>
        </div>

        {/* Tree sitting on island */}
        <div className={`absolute w-12 h-12 -top-10 left-2 transition-transform duration-200 group-hover:scale-110 ${isDead ? "grayscale opacity-60" : ""}`}>
          <TreeIcon treeType={tree.treeType} dead={isDead} />
        </div>
      </div>

      {/* Date label */}
      <p className="text-[9px] text-neutral-500 dark:text-neutral-600 mt-1 text-center leading-tight">
        {label}
      </p>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 leading-none">{value}</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForestPage() {
  const { user }  = useAuth();
  const { forestTrees, setForestTrees } = usePomodoroContext();
  const [loading, setLoading] = useState(forestTrees.length === 0);

  useEffect(() => {
    if (!user || forestTrees.length > 0) { setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "users", user.uid, "pomodoroSessions"), orderBy("completedAt", "desc"), limit(200))
        );
        setForestTrees(snap.docs.map(d => ({ id: d.id, ...d.data() } as ForestTree)));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const completed = forestTrees.filter(t => t.status !== "abandoned" && t.completed !== false && t.treeType !== "dead");
  const abandoned = forestTrees.filter(t => t.status === "abandoned" || t.completed === false || t.treeType === "dead");
  const totalMins = completed.reduce((a, t) => a + (t.duration ?? 25), 0);

  // Streak calculation
  const daySet = new Set(completed.map(t =>
    new Date(t.completedAt.seconds * 1000).toISOString().split("T")[0]
  ));
  let streak = 0;
  const d = new Date();
  while (daySet.has(d.toISOString().split("T")[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <style>{`
        @keyframes tile-in {
          from { opacity: 0; transform: translateY(16px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              My Forest 🌳
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
              Every completed focus session grows a tree.
            </p>
          </div>
          <Link href="/pomodoro"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
            + Plant a tree
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatPill icon="🌳" value={completed.length}  label="Trees planted" />
          <StatPill icon="⏱" value={`${Math.round(totalMins / 60)}h`} label="Focus time" />
          <StatPill icon="🔥" value={`${streak}d`}      label="Current streak" />
          <StatPill icon="💀" value={abandoned.length}  label="Abandoned" />
        </div>

        {/* Forest island grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        ) : forestTrees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 mb-4 opacity-20">
              <MiniOak />
            </div>
            <p className="text-neutral-500 dark:text-neutral-500 font-medium mb-1">Your forest is empty</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-600 mb-4">
              Complete a Pomodoro session to plant your first tree.
            </p>
            <Link href="/pomodoro"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
              Start a session
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                {forestTrees.length} tree{forestTrees.length !== 1 ? "s" : ""} total
              </h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neutral-500 inline-block" /> Abandoned</span>
              </div>
            </div>

            {/* Island grid */}
            <div
              className="flex flex-wrap gap-4 pt-4"
              style={{ minHeight: 120 }}
            >
              {forestTrees.map((tree, i) => (
                <IslandTile key={tree.id} tree={tree} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
