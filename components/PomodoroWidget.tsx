"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

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

export default function PomodoroWidget() {
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
    } catch {}
  }

  return (
    <section
      style={{
        padding: "1rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Pomodoro</h2>
        <Link href="/pomodoro" style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          Full view →
        </Link>
      </div>

      <div style={{ opacity: 0.8, marginTop: "0.5rem" }}>{phaseLabel}</div>
      <div style={{ fontSize: "2.25rem", fontWeight: 800, marginTop: "0.25rem" }}>
        {formatTime(secondsLeft)}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setIsRunning((r) => !r)}
          style={{ padding: "0.45rem 0.8rem", borderRadius: 10, cursor: "pointer" }}
        >
          {isRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft((phase === "focus" ? focusMins : breakMins) * 60);
          }}
          style={{ padding: "0.45rem 0.8rem", borderRadius: 10, cursor: "pointer" }}
        >
          Reset
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            if (phase === "focus") {
              setPhase("break");
              setSecondsLeft(breakMins * 60);
            } else {
              setPhase("focus");
              setSecondsLeft(focusMins * 60);
            }
          }}
          style={{ padding: "0.45rem 0.8rem", borderRadius: 10, cursor: "pointer" }}
        >
          Switch
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Focus</span>
          <input
            type="number"
            min={1}
            max={180}
            value={focusMins}
            disabled={isRunning}
            onChange={(e) => setFocusMins(clampInt(Number(e.target.value), 1, 180))}
            style={{ width: 90, padding: "0.35rem", borderRadius: 8 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Break</span>
          <input
            type="number"
            min={1}
            max={60}
            value={breakMins}
            disabled={isRunning}
            onChange={(e) => setBreakMins(clampInt(Number(e.target.value), 1, 60))}
            style={{ width: 90, padding: "0.35rem", borderRadius: 8 }}
          />
        </label>
      </div>

      <div style={{ marginTop: "0.6rem", fontSize: "0.85rem", opacity: 0.7 }}>
        Completing focus cycles grows your forest.
      </div>
    </section>
  );
}
