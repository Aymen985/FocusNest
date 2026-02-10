"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY_TOTAL = "focusnest_total_sessions";
const STORAGE_KEY_TODAY = "focusnest_today_sessions";
const STORAGE_KEY_DATE = "focusnest_today_date";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeNumber(value: string | null) {
  const n = Number(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

// Growth frames for the newest completed cycle
const GROWTH_FRAMES = ["🌱", "🌿", "🌳"] as const;

export default function ProgressPage() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);

  // For animating the newest tree
  const [animIndex, setAnimIndex] = useState<number | null>(null);
  const [animFrame, setAnimFrame] = useState<number>(GROWTH_FRAMES.length - 1); // default to tree
  const prevTotalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function triggerNewTreeAnimation(newTotal: number) {
    // New tree is last item: index newTotal - 1
    clearTimers();
    setAnimIndex(newTotal - 1);
    setAnimFrame(0);

    // Progress through growth frames quickly
    const t1 = window.setTimeout(() => setAnimFrame(1), 350);
    const t2 = window.setTimeout(() => setAnimFrame(2), 750);
    const t3 = window.setTimeout(() => {
      // End animation
      setAnimIndex(null);
      setAnimFrame(2);
    }, 950);

    timersRef.current.push(t1, t2, t3);
  }

  useEffect(() => {
    try {
      // Reset "today" counter if date changed
      const today = getTodayKey();
      const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
      if (savedDate !== today) {
        localStorage.setItem(STORAGE_KEY_DATE, today);
        localStorage.setItem(STORAGE_KEY_TODAY, "0");
      }

      const initialTotal = safeNumber(localStorage.getItem(STORAGE_KEY_TOTAL));
      const initialToday = safeNumber(localStorage.getItem(STORAGE_KEY_TODAY));
      setTotalSessions(initialTotal);
      setTodaySessions(initialToday);
      prevTotalRef.current = initialTotal;

      const syncFromStorage = () => {
        const nextTotal = safeNumber(localStorage.getItem(STORAGE_KEY_TOTAL));
        const nextToday = safeNumber(localStorage.getItem(STORAGE_KEY_TODAY));

        // If a focus cycle completed, total increments by 1: animate the new tree
        if (nextTotal > prevTotalRef.current) {
          triggerNewTreeAnimation(nextTotal);
        }
        prevTotalRef.current = nextTotal;

        setTotalSessions(nextTotal);
        setTodaySessions(nextToday);
      };

      // Update when storage changes (other tabs)
      const onStorage = () => syncFromStorage();
      window.addEventListener("storage", onStorage);

      // Also poll so it updates when Pomodoro runs in the same tab
      const interval = window.setInterval(syncFromStorage, 1000);

      return () => {
        window.removeEventListener("storage", onStorage);
        window.clearInterval(interval);
        clearTimers();
      };
    } catch {
      setTotalSessions(0);
      setTodaySessions(0);
    }
  }, []);

  // Build the forest: one tree per completed focus session
  // To keep rendering fast, show up to 120 icons and collapse the rest.
  const MAX_VISIBLE = 120;

  const { visibleCount, hiddenCount } = useMemo(() => {
    const visible = Math.min(totalSessions, MAX_VISIBLE);
    const hidden = Math.max(0, totalSessions - MAX_VISIBLE);
    return { visibleCount: visible, hiddenCount: hidden };
  }, [totalSessions]);

  const forestCells = useMemo(() => {
    const cells: string[] = [];
    for (let i = 0; i < visibleCount; i++) {
      // If this is the newest one and animation is active, show growth frames
      if (animIndex !== null && i === animIndex) {
        cells.push(GROWTH_FRAMES[animFrame]);
      } else {
        // Completed cycles are full trees
        cells.push("🌳");
      }
    }
    return cells;
  }, [visibleCount, animIndex, animFrame]);

  function handleResetProgress() {
    if (!confirm("Reset forest? This clears total and today counters.")) return;
    try {
      localStorage.setItem(STORAGE_KEY_TOTAL, "0");
      localStorage.setItem(STORAGE_KEY_TODAY, "0");
      localStorage.setItem(STORAGE_KEY_DATE, getTodayKey());
    } catch {}
    clearTimers();
    prevTotalRef.current = 0;
    setAnimIndex(null);
    setAnimFrame(GROWTH_FRAMES.length - 1);
    setTotalSessions(0);
    setTodaySessions(0);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 980 }}>
      <h1>Progress Tracker</h1>
      <p style={{ opacity: 0.8 }}>
        Each completed <b>Focus</b> session grows a new plant into a tree. Do enough cycles and you build a forest.
      </p>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ opacity: 0.8 }}>Today</div>
            <div style={{ fontSize: "2rem", fontWeight: 700 }}>{todaySessions}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8 }}>Total focus sessions</div>
            <div style={{ fontSize: "2rem", fontWeight: 700 }}>{totalSessions}</div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ opacity: 0.85, marginBottom: "0.75rem" }}>Your forest</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(28px, 1fr))",
              gap: "10px",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.10)",
              minHeight: "120px",
            }}
          >
            {forestCells.length === 0 ? (
              <div style={{ opacity: 0.7 }}>
                No trees yet. Complete one focus cycle to grow your first 🌱
              </div>
            ) : (
              forestCells.map((icon, idx) => {
                const isAnimating = animIndex !== null && idx === animIndex;
                return (
                  <div
                    key={`${idx}-${icon}-${isAnimating ? animFrame : "done"}`}
                    style={{
                      fontSize: "24px",
                      lineHeight: "24px",
                      textAlign: "center",
                      userSelect: "none",
                      transformOrigin: "bottom center",
                      animation: isAnimating ? "pop 420ms ease-out" : undefined,
                    }}
                    title={isAnimating ? "Growing..." : "Tree"}
                  >
                    {icon}
                  </div>
                );
              })
            )}
          </div>

          {hiddenCount > 0 && (
            <div style={{ marginTop: "0.75rem", opacity: 0.75 }}>
              Showing first {MAX_VISIBLE} trees. (+{hiddenCount} more)
            </div>
          )}
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <button
            onClick={handleResetProgress}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          >
            Reset Forest
          </button>
        </div>
      </section>

      <style jsx global>{`
        @keyframes pop {
          0% {
            transform: scale(0.75) translateY(6px);
          }
          65% {
            transform: scale(1.15) translateY(-2px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
