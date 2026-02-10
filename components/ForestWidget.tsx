"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY_TOTAL = "focusnest_total_sessions";

function safeNumber(value: string | null) {
  const n = Number(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

export default function ForestWidget() {
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const sync = () => {
      try {
        setTotalSessions(safeNumber(localStorage.getItem(STORAGE_KEY_TOTAL)));
      } catch {
        setTotalSessions(0);
      }
    };

    sync();
    const interval = window.setInterval(sync, 1000);
    window.addEventListener("storage", sync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const trees = useMemo(() => {
    const max = 36; // keep dashboard tidy
    const visible = Math.min(max, totalSessions);
    const hidden = Math.max(0, totalSessions - max);
    return { visible, hidden };
  }, [totalSessions]);

  return (
    <section
      style={{
        padding: "1rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Forest</h2>
        <Link href="/progress" style={{ opacity: 0.8, fontSize: "0.9rem" }}>
          Full view →
        </Link>
      </div>

      <div style={{ marginTop: "0.5rem", opacity: 0.85 }}>
        Total focus cycles: <b>{totalSessions}</b>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "10px",
          padding: "0.75rem",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          minHeight: 140,
        }}
      >
        {trees.visible === 0 ? (
          <div style={{ opacity: 0.7 }}>Complete a focus cycle to grow your first 🌱</div>
        ) : (
          Array.from({ length: trees.visible }).map((_, i) => (
            <div key={i} style={{ fontSize: 22, textAlign: "center", userSelect: "none" }}>
              🌳
            </div>
          ))
        )}
      </div>

      {trees.hidden > 0 && (
        <div style={{ marginTop: "0.6rem", opacity: 0.7, fontSize: "0.9rem" }}>
          +{trees.hidden} more trees…
        </div>
      )}
    </section>
  );
}
