"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Phase    = "focus" | "break";
export type TreeType = "oak" | "pine" | "cherry" | "cactus";
export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export interface ForestTree {
  id: string;
  treeType: TreeType;
  duration: number;
  label: string;
  completedAt: { seconds: number };
}

interface PomodoroContextValue {
  // Settings
  focusMins:    number;
  breakMins:    number;
  label:        string;
  setFocusMins: (n: number) => void;
  setBreakMins: (n: number) => void;
  setLabel:     (s: string) => void;

  // Timer state
  phase:       Phase;
  secondsLeft: number;
  isRunning:   boolean;
  elapsed:     number;
  currentTree: TreeType | null;
  growthStage: GrowthStage;
  focusProgress: number;

  // Forest
  forestTrees:  ForestTree[];
  loadingForest: boolean;
  setForestTrees: React.Dispatch<React.SetStateAction<ForestTree[]>>;

  // Celebration
  showCelebration: boolean;

  // Actions
  handleStart:       () => void;
  handlePause:       () => void;
  handleReset:       () => void;
  handleSwitchPhase: () => void;

  // Mini indicator (for navbar badge)
  isActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(isFinite(v) ? v : min)));
}

const TREE_TYPES: TreeType[] = ["oak", "pine", "cherry", "cactus"];
export function randomTreeType(): TreeType {
  return TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
}

export function getGrowthStage(elapsed: number, total: number): GrowthStage {
  const pct = total > 0 ? elapsed / total : 0;
  if (pct < 0.2) return 0;
  if (pct < 0.4) return 1;
  if (pct < 0.6) return 2;
  if (pct < 0.8) return 3;
  return 4;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [label,     setLabel]     = useState("");

  const [phase,       setPhase]       = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning,   setIsRunning]   = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [currentTree, setCurrentTree] = useState<TreeType | null>(null);

  const [forestTrees,   setForestTrees]   = useState<ForestTree[]>([]);
  const [loadingForest, setLoadingForest] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const intervalRef    = useRef<number | null>(null);
  const totalFocusSecs = clampInt(focusMins, 1, 180) * 60;

  // Sync timer when settings change (only if not running)
  useEffect(() => {
    if (isRunning) return;
    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    if (phase === "break") setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMins, breakMins]);

  // Tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(p => p - 1);
      if (phase === "focus") setElapsed(p => p + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isRunning, phase]);

  // Session complete
  useEffect(() => {
    if (secondsLeft > 0) return;
    setIsRunning(false);
    if (phase === "focus") {
      handleFocusComplete();
    } else {
      setPhase("focus");
      setElapsed(0);
      setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
      setCurrentTree(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  async function handleFocusComplete() {
    const treeType = currentTree ?? "oak";
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    if (user) {
      try {
        const docRef = await addDoc(collection(db, "users", user.uid, "pomodoroSessions"), {
          completedAt: serverTimestamp(),
          duration: clampInt(focusMins, 1, 180),
          label: label || "Focus session",
          treeType,
        });
        const newTree: ForestTree = {
          id: docRef.id, treeType,
          duration: focusMins,
          label: label || "Focus session",
          completedAt: { seconds: Math.floor(Date.now() / 1000) },
        };
        setForestTrees(prev => [newTree, ...prev]);
      } catch (e) { console.error(e); }
    }

    const bm = clampInt(breakMins, 1, 60);
    setPhase("break");
    setSecondsLeft(bm * 60);
    setElapsed(0);
    setCurrentTree(null);
    setIsRunning(true);
  }

  const handleStart = useCallback(() => {
    if (phase === "focus" && !currentTree) {
      setCurrentTree(randomTreeType());
      setElapsed(0);
    }
    setIsRunning(true);
  }, [phase, currentTree]);

  const handlePause = useCallback(() => setIsRunning(false), []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentTree(null);
    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    else setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
  }, [phase, focusMins, breakMins]);

  const handleSwitchPhase = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setCurrentTree(null);
    if (phase === "focus") {
      setPhase("break");
      setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
    } else {
      setPhase("focus");
      setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    }
  }, [phase, focusMins, breakMins]);

  const growthStage: GrowthStage = phase === "focus" && elapsed > 0
    ? getGrowthStage(elapsed, totalFocusSecs)
    : 0;

  const focusProgress = phase === "focus" ? elapsed / totalFocusSecs : 1;
  const isActive      = isRunning;

  return (
    <PomodoroContext.Provider value={{
      focusMins, breakMins, label,
      setFocusMins, setBreakMins, setLabel,
      phase, secondsLeft, isRunning, elapsed,
      currentTree, growthStage, focusProgress,
      forestTrees, loadingForest, setForestTrees,
      showCelebration,
      handleStart, handlePause, handleReset, handleSwitchPhase,
      isActive,
    }}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoroContext must be used inside PomodoroProvider");
  return ctx;
}
