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
      try { setTotalSessions(safeNumber(localStorage.getItem(STORAGE_KEY_TOTAL))); }
      catch { setTotalSessions(0); }
    };
    sync();
    const iv = window.setInterval(sync, 1000);
    window.addEventListener("storage", sync);
    return () => { window.clearInterval(iv); window.removeEventListener("storage", sync); };
  }, []);

  const { visible, hidden } = useMemo(() => {
    const max     = 36;
    const visible = Math.min(max, totalSessions);
    const hidden  = Math.max(0, totalSessions - max);
    return { visible, hidden };
  }, [totalSessions]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-100">Forest</h2>
        <Link href="/progress" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
          Full view ?
        </Link>
      </div>

      {/* Count */}
      <p className="text-xs text-neutral-500 mb-3">
        Total focus cycles:{" "}
        <span className="font-semibold text-neutral-300">{totalSessions}</span>
      </p>

      {/* Tree grid */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 min-h-[120px] grid grid-cols-6 gap-2">
        {visible === 0 ? (
          <div className="col-span-6 flex items-center justify-center text-xs text-neutral-600 text-center py-4">
            Complete a focus cycle to grow your first ??
          </div>
        ) : (
          Array.from({ length: visible }).map((_, i) => (
            <div key={i} className="text-xl text-center select-none leading-none">
              ??
            </div>
          ))
        )}
      </div>

      {hidden > 0 && (
        <p className="text-xs text-neutral-600 mt-2">+{hidden} more trees�</p>
      )}
    </div>
  );
}
