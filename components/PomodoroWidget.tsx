"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { updateUserStats } from "@/lib/userProfile";

type Phase = "focus" | "break";

function clampInt(value: number, min: number, max: number) {
  const n = Math.floor(Number.isFinite(value) ? value : min);
  return Math.max(min, Math.min(max, n));
}

function formatTime(totalSeconds: number) {
  const s  = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const STORAGE_KEY_TOTAL = "focusnest_total_sessions";
const STORAGE_KEY_TODAY = "focusnest_today_sessions";
const STORAGE_KEY_DATE  = "focusnest_today_date";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function PomodoroWidget() {
  const { user } = useAuth();

  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [phase, setPhase]         = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const phaseLabel  = useMemo(() => (phase === "focus" ? "Focus" : "Break"), [phase]);

  // Sync timer display when settings change (only when not running)
  useEffect(() => {
    if (isRunning) return;
    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    if (phase === "break") setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
  }, [focusMins, breakMins, phase, isRunning]);

  // Tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current !== null) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    return () => { if (intervalRef.current !== null) { window.clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isRunning]);

  // Phase complete
  useEffect(() => {
    if (secondsLeft > 0) return;
    (async () => {
      setIsRunning(false);
      if (phase === "focus") {
        await incrementProgress();
        setPhase("break");
        setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
        setIsRunning(true);
      } else {
        setPhase("focus");
        setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
        setIsRunning(true);
      }
    })();
  }, [secondsLeft, phase, breakMins, focusMins]);

  async function incrementProgress() {
    try {
      const currentTotal = Number(localStorage.getItem(STORAGE_KEY_TOTAL) ?? "0");
      localStorage.setItem(STORAGE_KEY_TOTAL, String(currentTotal + 1));
      const today = getTodayKey();
      if (localStorage.getItem(STORAGE_KEY_DATE) !== today) {
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_TODAY, "0");
      }
      const currentToday = Number(localStorage.getItem(STORAGE_KEY_TODAY) ?? "0");
      localStorage.setItem(STORAGE_KEY_TODAY, String(currentToday + 1));
      if (user) await updateUserStats(user.uid);
    } catch (e) {
      console.error("Failed to update progress:", e);
    }
  }

  const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border";

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-100">Pomodoro</h2>
        <Link href="/pomodoro" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          Full view →
        </Link>
      </div>

      {/* Phase + timer */}
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
        {phaseLabel}
      </p>
      <p className="text-4xl font-extrabold text-neutral-50 tabular-nums tracking-tight">
        {formatTime(secondsLeft)}
      </p>

      {/* Controls */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className={`${btnBase} ${
            isRunning
              ? "bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
              : "bg-indigo-500 border-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setIsRunning(false); setSecondsLeft((phase === "focus" ? focusMins : breakMins) * 60); }}
          className={`${btnBase} bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500`}
        >
          Reset
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            if (phase === "focus") { setPhase("break"); setSecondsLeft(breakMins * 60); }
            else { setPhase("focus"); setSecondsLeft(focusMins * 60); }
          }}
          className={`${btnBase} bg-transparent border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-500`}
        >
          Switch
        </button>
      </div>

      {/* Settings */}
      <div className="flex gap-4 mt-4">
        {[
          { label: "Focus", value: focusMins, min: 1, max: 180, set: setFocusMins },
          { label: "Break", value: breakMins, min: 1, max: 60,  set: setBreakMins },
        ].map(({ label, value, min, max, set }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">{label}</span>
            <input
              type="number"
              min={min}
              max={max}
              value={value}
              disabled={isRunning}
              onChange={(e) => set(clampInt(Number(e.target.value), min, max))}
              className="w-16 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-neutral-100 text-center focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-600 mt-3">
        Completing focus cycles grows your forest.
      </p>
    </div>
  );
}
