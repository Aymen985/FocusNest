"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type Phase      = "focus" | "break";
export type TreeType   = "oak" | "pine" | "cherry" | "cactus";
export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export interface ForestTree {
  id: string;
  treeType: TreeType | "dead";
  duration: number;
  label: string;
  completedAt: { seconds: number };
  status?: "completed" | "abandoned";
  completed?: boolean;
}

interface PomodoroContextValue {
  focusMins: number; breakMins: number; label: string;
  setFocusMins: (n: number) => void;
  setBreakMins: (n: number) => void;
  setLabel: (s: string) => void;
  phase: Phase; secondsLeft: number; isRunning: boolean; elapsed: number;
  currentTree: TreeType | null; growthStage: GrowthStage; focusProgress: number;
  forestTrees: ForestTree[]; loadingForest: boolean;
  setForestTrees: React.Dispatch<React.SetStateAction<ForestTree[]>>;
  showCelebration: boolean;
  handleStart: () => void; handlePause: () => void;
  handleReset: () => void; handleSwitchPhase: () => void;
  isActive: boolean;
}

export function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(isFinite(v) ? v : min)));
}
const TREE_TYPES: TreeType[] = ["oak", "pine", "cherry", "cactus"];
export function randomTreeType(): TreeType {
  return TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
}
export function getGrowthStage(elapsed: number, total: number): GrowthStage {
  const pct = total > 0 ? elapsed / total : 0;
  if (pct < 0.2) return 0; if (pct < 0.4) return 1;
  if (pct < 0.6) return 2; if (pct < 0.8) return 3; return 4;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [label, setLabel] = useState("");
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentTree, setCurrentTree] = useState<TreeType | null>(null);
  const [forestTrees, setForestTrees] = useState<ForestTree[]>([]);
  const [loadingForest] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Timestamp-based timer refs — survive component unmount/remount on navigation
  const startedAtRef    = useRef<number | null>(null);
  const baseSecsRef     = useRef<number>(25 * 60);
  const baseElapsedRef  = useRef<number>(0);
  const intervalRef     = useRef<number | null>(null);
  const phaseRef        = useRef<Phase>("focus");
  const focusMinsRef    = useRef(25);
  const breakMinsRef    = useRef(5);
  const labelRef        = useRef("");
  const currentTreeRef  = useRef<TreeType | null>(null);
  const elapsedRef      = useRef(0);
  const secondsLeftRef  = useRef(25 * 60);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { focusMinsRef.current = focusMins; }, [focusMins]);
  useEffect(() => { breakMinsRef.current = breakMins; }, [breakMins]);
  useEffect(() => { labelRef.current = label; }, [label]);
  useEffect(() => { currentTreeRef.current = currentTree; }, [currentTree]);
  useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

  // Sync timer display when settings change (not running)
  useEffect(() => {
    if (isRunning) return;
    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    if (phase === "break") setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMins, breakMins]);

  const phaseCompleteRef = useRef<() => void>(() => {});

  function startTick() {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      if (!startedAtRef.current) return;
      const wall = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const newSecs = Math.max(0, baseSecsRef.current - wall);
      const newElapsed = phaseRef.current === "focus"
        ? baseElapsedRef.current + wall : baseElapsedRef.current;
      setSecondsLeft(newSecs);
      if (phaseRef.current === "focus") setElapsed(newElapsed);
      if (newSecs <= 0) { stopTick(); setIsRunning(false); phaseCompleteRef.current(); }
    }, 500);
  }

  function stopTick() {
    if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
    startedAtRef.current = null;
  }

  async function doFocusComplete() {
    const treeType = currentTreeRef.current ?? "oak";
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    if (user) {
      try {
        const docRef = await addDoc(collection(db, "users", user.uid, "pomodoroSessions"), {
          completedAt: serverTimestamp(),
          duration: clampInt(focusMinsRef.current, 1, 180),
          label: labelRef.current || "Focus session",
          treeType, status: "completed", completed: true,
        });
        setForestTrees(prev => [{
          id: docRef.id, treeType,
          duration: focusMinsRef.current,
          label: labelRef.current || "Focus session",
          completedAt: { seconds: Math.floor(Date.now() / 1000) },
          status: "completed", completed: true,
        }, ...prev]);
      } catch (e) { console.error(e); }
    }
    const bm = clampInt(breakMinsRef.current, 1, 60);
    phaseRef.current = "break";
    setPhase("break");
    setSecondsLeft(bm * 60);
    setElapsed(0);
    setCurrentTree(null);
    baseSecsRef.current = bm * 60;
    baseElapsedRef.current = 0;
    startedAtRef.current = Date.now();
    setIsRunning(true);
    startTick();
  }

  // Keep phaseCompleteRef up to date every render
  useEffect(() => {
    phaseCompleteRef.current = () => {
      if (phaseRef.current === "focus") {
        doFocusComplete();
      } else {
        const fm = clampInt(focusMinsRef.current, 1, 180);
        phaseRef.current = "focus";
        setPhase("focus");
        setSecondsLeft(fm * 60);
        setElapsed(0);
        setCurrentTree(null);
        baseSecsRef.current = fm * 60;
        baseElapsedRef.current = 0;
        startedAtRef.current = Date.now();
        setIsRunning(true);
        startTick();
      }
    };
  });

  useEffect(() => () => stopTick(), []);

  const handleStart = useCallback(() => {
    if (phaseRef.current === "focus" && !currentTreeRef.current) {
      const t = randomTreeType();
      setCurrentTree(t);
      currentTreeRef.current = t;
      setElapsed(0);
      baseElapsedRef.current = 0;
    }
    baseSecsRef.current = secondsLeftRef.current;
    baseElapsedRef.current = elapsedRef.current;
    startedAtRef.current = Date.now();
    setIsRunning(true);
    startTick();
  }, []);

  const handlePause = useCallback(() => {
    stopTick();
    setIsRunning(false);
    baseSecsRef.current = secondsLeftRef.current;
    baseElapsedRef.current = elapsedRef.current;
  }, []);

  const handleReset = useCallback(async () => {
    if (phaseRef.current === "focus" && elapsedRef.current > 10 && currentTreeRef.current && user) {
      try {
        const docRef = await addDoc(collection(db, "users", user.uid, "pomodoroSessions"), {
          completedAt: serverTimestamp(),
          duration: Math.floor(elapsedRef.current / 60) || 1,
          label: labelRef.current || "Abandoned session",
          treeType: "dead", status: "abandoned", completed: false,
        });
        setForestTrees(prev => [{
          id: docRef.id, treeType: "dead",
          duration: Math.floor(elapsedRef.current / 60) || 1,
          label: labelRef.current || "Abandoned session",
          completedAt: { seconds: Math.floor(Date.now() / 1000) },
          status: "abandoned", completed: false,
        }, ...prev]);
      } catch (e) { console.error(e); }
    }
    stopTick();
    setIsRunning(false);
    setElapsed(0);
    setCurrentTree(null);
    baseElapsedRef.current = 0;
    currentTreeRef.current = null;
    const secs = phaseRef.current === "focus"
      ? clampInt(focusMinsRef.current, 1, 180) * 60
      : clampInt(breakMinsRef.current, 1, 60) * 60;
    setSecondsLeft(secs);
    baseSecsRef.current = secs;
  }, [user]);

  const handleSwitchPhase = useCallback(() => {
    stopTick();
    setIsRunning(false);
    setElapsed(0);
    setCurrentTree(null);
    baseElapsedRef.current = 0;
    currentTreeRef.current = null;
    if (phaseRef.current === "focus") {
      const secs = clampInt(breakMinsRef.current, 1, 60) * 60;
      phaseRef.current = "break"; setPhase("break");
      setSecondsLeft(secs); baseSecsRef.current = secs;
    } else {
      const secs = clampInt(focusMinsRef.current, 1, 180) * 60;
      phaseRef.current = "focus"; setPhase("focus");
      setSecondsLeft(secs); baseSecsRef.current = secs;
    }
  }, []);

  const totalFocusSecs = clampInt(focusMins, 1, 180) * 60;
  const growthStage: GrowthStage = phase === "focus" && elapsed > 0
    ? getGrowthStage(elapsed, totalFocusSecs) : 0;
  const focusProgress = phase === "focus" ? elapsed / totalFocusSecs : 1;

  return (
    <PomodoroContext.Provider value={{
      focusMins, breakMins, label, setFocusMins, setBreakMins, setLabel,
      phase, secondsLeft, isRunning, elapsed,
      currentTree, growthStage, focusProgress,
      forestTrees, loadingForest, setForestTrees,
      showCelebration,
      handleStart, handlePause, handleReset, handleSwitchPhase,
      isActive: isRunning,
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
