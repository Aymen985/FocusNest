"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "focus" | "break";

function clampInt(value: number, min: number, max: number) {
  const n = Math.floor(Number.isFinite(value) ? value : min);
  return Math.max(min, Math.min(max, n));
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const STORAGE_KEY_TOTAL = "focusnest_total_sessions";
const STORAGE_KEY_TODAY = "focusnest_today_sessions";
const STORAGE_KEY_DATE = "focusnest_today_date";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function PomodoroPage() {
  const [focusMins, setFocusMins] = useState<number>(25);
  const [breakMins, setBreakMins] = useState<number>(5);

  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const intervalRef = useRef<number | null>(null);

  const phaseLabel = useMemo(() => (phase === "focus" ? "Focus" : "Break"), [phase]);

  useEffect(() => {
    if (isRunning) return;

    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    if (phase === "break") setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMins, breakMins]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current !== null) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    setIsRunning(false);

    if (phase === "focus") {
      incrementProgress();
      const bm = clampInt(breakMins, 1, 60);
      setPhase("break");
      setSecondsLeft(bm * 60);
      setIsRunning(true);
    } else {
      const fm = clampInt(focusMins, 1, 180);
      setPhase("focus");
      setSecondsLeft(fm * 60);
      setIsRunning(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function incrementProgress() {
    try {
      const currentTotal = Number(localStorage.getItem(STORAGE_KEY_TOTAL) ?? "0");
      localStorage.setItem(STORAGE_KEY_TOTAL, String(currentTotal + 1));

      const today = getTodayKey();
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      if (savedDate !== today) {
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_TODAY, "0");
      }
      const currentToday = Number(localStorage.getItem(STORAGE_KEY_TODAY) ?? "0");
      localStorage.setItem(STORAGE_KEY_TODAY, String(currentToday + 1));
    } catch {
      // ignore
    }
  }

  function handleStart() {
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    if (phase === "focus") setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    if (phase === "break") setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
  }

  function handleSwitchPhase() {
    setIsRunning(false);
    if (phase === "focus") {
      setPhase("break");
      setSecondsLeft(clampInt(breakMins, 1, 60) * 60);
    } else {
      setPhase("focus");
      setSecondsLeft(clampInt(focusMins, 1, 180) * 60);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 720 }}>
      <h1>Pomodoro Timer</h1>
      <p style={{ opacity: 0.8 }}>
        Focus sessions increment your progress automatically when they complete.
      </p>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            Focus (minutes)
            <input
              type="number"
              min={1}
              max={180}
              value={focusMins}
              onChange={(e) => setFocusMins(clampInt(Number(e.target.value), 1, 180))}
              style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #ccc" }}
              disabled={isRunning}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            Break (minutes)
            <input
              type="number"
              min={1}
              max={60}
              value={breakMins}
              onChange={(e) => setBreakMins(clampInt(Number(e.target.value), 1, 60))}
              style={{ padding: "0.5rem", borderRadius: 8, border: "1px solid #ccc" }}
              disabled={isRunning}
            />
          </label>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>{phaseLabel} phase</div>
          <div style={{ fontSize: "3rem", fontWeight: 700, marginTop: "0.25rem" }}>
            {formatTime(secondsLeft)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          {!isRunning ? (
            <button onClick={handleStart} style={{ padding: "0.6rem 1rem", borderRadius: 10 }}>
              Start
            </button>
          ) : (
            <button onClick={handlePause} style={{ padding: "0.6rem 1rem", borderRadius: 10 }}>
              Pause
            </button>
          )}

          <button onClick={handleReset} style={{ padding: "0.6rem 1rem", borderRadius: 10 }}>
            Reset
          </button>

          <button onClick={handleSwitchPhase} style={{ padding: "0.6rem 1rem", borderRadius: 10 }}>
            Switch to {phase === "focus" ? "Break" : "Focus"}
          </button>
        </div>
      </section>
    </main>
  );
}
