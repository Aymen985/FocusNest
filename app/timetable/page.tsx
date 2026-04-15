"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, serverTimestamp, query, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "mandatory" | "optional";
type Status   = "planned" | "in-progress" | "completed" | "missed";

interface SessionTemplate {
  id: string;
  title: string;
  duration: number;
  priority: Priority;
  color: string;
  description: string;
}

interface OneTimeSlot {
  id: string;
  title: string;
  duration: number;
  priority: Priority;
  color: string;
  description: string;
}

interface ScheduledSession {
  id: string;
  templateId: string;
  title: string;
  duration: number;
  priority: Priority;
  color: string;
  description: string;
  dayIndex: number;
  startMinute: number;
  status: Status;
  weekKey: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_PALETTE = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Emerald", value: "#10b981" },
  { label: "Sky",     value: "#0ea5e9" },
  { label: "Violet",  value: "#8b5cf6" },
  { label: "Pink",    value: "#ec4899" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Orange",  value: "#f97316" },
  { label: "Lime",    value: "#84cc16" },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180];
const GRID_START = 480;
const GRID_END   = 1320;
const GRID_TOTAL = GRID_END - GRID_START;
const PX_PER_MIN = 2;
const SNAP       = 15;
const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_HEIGHT = GRID_TOTAL * PX_PER_MIN;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekKey(monday: Date): string {
  const y     = monday.getFullYear();
  const start = new Date(y, 0, 1);
  const week  = Math.ceil(((monday.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${y}-${String(week).padStart(2, "0")}`;
}

function getMondayOfWeek(offset = 0): Date {
  const now  = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(now);
  mon.setDate(now.getDate() + diff + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatTime(minutes: number): string {
  const h      = Math.floor(minutes / 60);
  const m      = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function snapTo(value: number, snap: number): number {
  return Math.round(value / snap) * snap;
}

function hasConflict(
  sessions: ScheduledSession[], dayIndex: number,
  startMinute: number, duration: number, excludeId?: string
): boolean {
  return sessions.some((s) => {
    if (s.id === excludeId || s.dayIndex !== dayIndex) return false;
    return startMinute < s.startMinute + s.duration && startMinute + duration > s.startMinute;
  });
}

function makeUid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const STATUS_STYLES: Record<Status, string> = {
  planned:       "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300",
  "in-progress": "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  completed:     "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  missed:        "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

const blankForm = () => ({
  title: "", duration: 60, priority: "mandatory" as Priority,
  color: COLOR_PALETTE[0].value, description: "",
});

// ─── Shared form component ────────────────────────────────────────────────────

function SessionForm({
  value, onChange, onSubmit, onCancel, submitLabel, saving, error,
}: {
  value: ReturnType<typeof blankForm>;
  onChange: (f: ReturnType<typeof blankForm>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  saving: boolean;
  error: string;
}) {
  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>
      )}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wide">Title *</label>
        <input
          type="text" value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="e.g. Math Revision"
          autoFocus
          className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wide">Duration</label>
          <select value={value.duration} onChange={(e) => onChange({ ...value, duration: Number(e.target.value) })}
            className="w-full px-2 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{formatDuration(d)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wide">Priority</label>
          <select value={value.priority} onChange={(e) => onChange({ ...value, priority: e.target.value as Priority })}
            className="w-full px-2 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="mandatory">Mandatory</option>
            <option value="optional">Optional</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">Color</label>
        <div className="flex gap-1.5 flex-wrap">
          {COLOR_PALETTE.map((c) => (
            <button key={c.value} onClick={() => onChange({ ...value, color: c.value })} title={c.label}
              className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${value.color === c.value ? "ring-2 ring-offset-1 ring-neutral-400 dark:ring-neutral-500 scale-110" : ""}`}
              style={{ backgroundColor: c.value }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 uppercase tracking-wide">
          Description <span className="normal-case font-normal text-neutral-400">(optional)</span>
        </label>
        <textarea value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="What will you focus on?" rows={2}
          className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      {/* Live preview */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
        style={{ borderLeftColor: value.color, borderLeftWidth: 3 }}>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate flex-1">
          {value.title || "Untitled"}
        </p>
        <span className="text-[10px] text-neutral-400 shrink-0">{formatDuration(value.duration)}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={onSubmit} disabled={saving}
          className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {saving ? "Saving…" : submitLabel}
        </button>
        <button onClick={onCancel}
          className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [weekOffset, setWeekOffset] = useState(0);
  const monday  = getMondayOfWeek(weekOffset);
  const weekKey = getWeekKey(monday);

  const [templates,    setTemplates]    = useState<SessionTemplate[]>([]);
  const [oneTimeSlots, setOneTimeSlots] = useState<OneTimeSlot[]>([]);
  const [scheduled,    setScheduled]    = useState<ScheduledSession[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);

  type SidebarMode = null | "new-template" | "new-onetime";
  const [sidebarMode,   setSidebarMode]   = useState<SidebarMode>(null);
  const [sidebarForm,   setSidebarForm]   = useState(blankForm());
  const [sidebarError,  setSidebarError]  = useState("");
  const [sidebarSaving, setSidebarSaving] = useState(false);

  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editForm,   setEditForm]   = useState(blankForm());
  const [editError,  setEditError]  = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [selected,            setSelected]            = useState<ScheduledSession | null>(null);
  const [editingScheduled,    setEditingScheduled]    = useState(false);
  const [scheduledEditForm,   setScheduledEditForm]   = useState(blankForm());
  const [scheduledEditError,  setScheduledEditError]  = useState("");
  const [scheduledEditSaving, setScheduledEditSaving] = useState(false);

  const dragPayload = useRef<{
    type: "template" | "scheduled" | "onetime";
    templateId?: string;
    sessionId?: string;
    oneTimeId?: string;
    title: string; duration: number; color: string;
    priority: Priority; description: string; offsetMinutes: number;
  } | null>(null);
  const [ghostPos, setGhostPos] = useState<{ dayIndex: number; minute: number } | null>(null);

  const resizeRef = useRef<{ sessionId: string; originalDuration: number; startY: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoadingData(true);
      try {
        const uid = user!.uid;
        const tSnap = await getDocs(collection(db, "users", uid, "sessionTemplates"));
        setTemplates(tSnap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionTemplate)));

        const sSnap = await getDocs(
          query(collection(db, "users", uid, "scheduledSessions"), where("weekKey", "==", weekKey))
        );
        const sessions = sSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduledSession));

        const now        = new Date();
        const todayIdx   = (now.getDay() + 6) % 7;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const updated: ScheduledSession[] = [];
        for (const s of sessions) {
          const isPast =
            weekOffset < 0 ||
            (weekOffset === 0 && (
              s.dayIndex < todayIdx ||
              (s.dayIndex === todayIdx && s.startMinute + s.duration < nowMinutes)
            ));
          if (isPast && s.status === "planned") {
            await updateDoc(doc(db, "users", uid, "scheduledSessions", s.id), { status: "missed" });
            updated.push({ ...s, status: "missed" });
          } else {
            updated.push(s);
          }
        }
        setScheduled(updated);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [user, weekKey, weekOffset]);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  async function handleCreateTemplate() {
    if (!sidebarForm.title.trim()) { setSidebarError("Title is required."); return; }
    setSidebarError(""); setSidebarSaving(true);
    try {
      const data = { ...sidebarForm, title: sidebarForm.title.trim(), description: sidebarForm.description.trim() };
      const ref  = await addDoc(collection(db, "users", user!.uid, "sessionTemplates"), { ...data, createdAt: serverTimestamp() });
      setTemplates((p) => [...p, { id: ref.id, ...data }]);
      setSidebarForm(blankForm());
      setSidebarMode(null);
    } finally { setSidebarSaving(false); }
  }

  function handleCreateOneTime() {
    if (!sidebarForm.title.trim()) { setSidebarError("Title is required."); return; }
    setSidebarError("");
    setOneTimeSlots((p) => [...p, { id: makeUid(), ...sidebarForm, title: sidebarForm.title.trim(), description: sidebarForm.description.trim() }]);
    setSidebarForm(blankForm());
    setSidebarMode(null);
  }

  async function handleSaveTemplateEdit(id: string) {
    if (!editForm.title.trim()) { setEditError("Title is required."); return; }
    setEditError(""); setEditSaving(true);
    try {
      const data = { ...editForm, title: editForm.title.trim(), description: editForm.description.trim() };
      await updateDoc(doc(db, "users", user!.uid, "sessionTemplates", id), data);
      setTemplates((p) => p.map((t) => t.id === id ? { ...t, ...data } : t));
      setEditingId(null);
    } finally { setEditSaving(false); }
  }

  async function handleDeleteTemplate(id: string) {
    await deleteDoc(doc(db, "users", user!.uid, "sessionTemplates", id));
    setTemplates((p) => p.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  async function handleDrop(e: React.DragEvent, dayIndex: number) {
    e.preventDefault();
    const payload = dragPayload.current;
    if (!payload || !user) return;

    const colEl  = e.currentTarget as HTMLElement;
    const rect   = colEl.getBoundingClientRect();
    const relY   = e.clientY - rect.top + colEl.scrollTop;
    const rawMin = GRID_START + relY / PX_PER_MIN;
    const startMinute = Math.max(GRID_START, Math.min(
      snapTo(rawMin - payload.offsetMinutes, SNAP), GRID_END - payload.duration
    ));

    if (payload.type === "template" || payload.type === "onetime") {
      const newSession: Omit<ScheduledSession, "id"> = {
        templateId: payload.type === "onetime" ? "one-time" : payload.templateId!,
        title: payload.title, duration: payload.duration,
        priority: payload.priority, color: payload.color,
        description: payload.description,
        dayIndex, startMinute, status: "planned", weekKey,
      };
      const ref = await addDoc(collection(db, "users", user.uid, "scheduledSessions"), newSession);
      setScheduled((p) => [...p, { id: ref.id, ...newSession }]);
      if (payload.type === "onetime" && payload.oneTimeId) {
        setOneTimeSlots((p) => p.filter((s) => s.id !== payload.oneTimeId));
      }
    } else if (payload.type === "scheduled" && payload.sessionId) {
      await updateDoc(doc(db, "users", user.uid, "scheduledSessions", payload.sessionId), { dayIndex, startMinute });
      setScheduled((p) => p.map((s) => s.id === payload.sessionId ? { ...s, dayIndex, startMinute } : s));
    }

    dragPayload.current = null;
    setGhostPos(null);
  }

  async function handleDeleteScheduled(id: string) {
    await deleteDoc(doc(db, "users", user!.uid, "scheduledSessions", id));
    setScheduled((p) => p.filter((s) => s.id !== id));
    setSelected(null);
  }

  async function handleStatusChange(id: string, status: Status) {
    await updateDoc(doc(db, "users", user!.uid, "scheduledSessions", id), { status });
    setScheduled((p) => p.map((s) => s.id === id ? { ...s, status } : s));
    setSelected((p) => p ? { ...p, status } : p);
  }

  async function handleSaveScheduledEdit(id: string) {
    if (!scheduledEditForm.title.trim()) { setScheduledEditError("Title is required."); return; }
    setScheduledEditError(""); setScheduledEditSaving(true);
    try {
      const data = { ...scheduledEditForm, title: scheduledEditForm.title.trim(), description: scheduledEditForm.description.trim() };
      await updateDoc(doc(db, "users", user!.uid, "scheduledSessions", id), data);
      setScheduled((p) => p.map((s) => s.id === id ? { ...s, ...data } : s));
      setSelected((p) => p ? { ...p, ...data } : p);
      setEditingScheduled(false);
    } finally { setScheduledEditSaving(false); }
  }

  // ── Resize ──────────────────────────────────────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent, sessionId: string, originalDuration: number) => {
    e.preventDefault(); e.stopPropagation();
    resizeRef.current = { sessionId, originalDuration, startY: e.clientY };
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!resizeRef.current) return;
      const delta       = snapTo((e.clientY - resizeRef.current.startY) / PX_PER_MIN, SNAP);
      const newDuration = Math.max(SNAP, resizeRef.current.originalDuration + delta);
      setScheduled((p) => p.map((s) => s.id === resizeRef.current!.sessionId ? { ...s, duration: newDuration } : s));
    }
    async function onMouseUp() {
      if (!resizeRef.current || !user) return;
      const s = scheduled.find((s) => s.id === resizeRef.current!.sessionId);
      if (s) await updateDoc(doc(db, "users", user.uid, "scheduledSessions", s.id), { duration: s.duration });
      resizeRef.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [scheduled, user]);

  // ── Week helpers ────────────────────────────────────────────────────────────
  function getDayDate(i: number): Date {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  }
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const sunday   = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const weekLabel = `${monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  const hourLabels: number[] = [];
  for (let m = GRID_START; m <= GRID_END; m += 60) hourLabels.push(m);

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading timetable…</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 120px)" }}>

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center min-w-[160px]">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{weekLabel}</p>
              <p className={`text-xs font-medium ${weekOffset === 0 ? "text-indigo-500" : "text-neutral-400"}`}>
                {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : weekOffset > 0 ? `+${weekOffset} weeks` : `${weekOffset} weeks`}
              </p>
            </div>
            <button onClick={() => setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)}
                className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                Today
              </button>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {(["planned", "in-progress", "completed", "missed"] as Status[]).map((s) => (
              <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_STYLES[s]}`}>{s}</span>
            ))}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left sidebar ───────────────────────────────────────────────── */}
          <div className="w-52 shrink-0 border-r border-neutral-100 dark:border-neutral-800 flex flex-col bg-neutral-50 dark:bg-neutral-950">
            <div className="p-3 space-y-1.5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <button
                onClick={() => { setSidebarMode(sidebarMode === "new-template" ? null : "new-template"); setSidebarForm(blankForm()); setSidebarError(""); setEditingId(null); }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                New Template
              </button>
              <button
                onClick={() => { setSidebarMode(sidebarMode === "new-onetime" ? null : "new-onetime"); setSidebarForm(blankForm()); setSidebarError(""); setEditingId(null); }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                One-time Slot
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">

              {/* Inline form */}
              {sidebarMode !== null && (
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 p-3 mb-1">
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
                    {sidebarMode === "new-template" ? "New Template" : "One-time Slot"}
                  </p>
                  <SessionForm
                    value={sidebarForm} onChange={setSidebarForm}
                    onSubmit={sidebarMode === "new-template" ? handleCreateTemplate : handleCreateOneTime}
                    onCancel={() => { setSidebarMode(null); setSidebarError(""); }}
                    submitLabel={sidebarMode === "new-template" ? "Save Template" : "Add to Queue"}
                    saving={sidebarSaving} error={sidebarError}
                  />
                </div>
              )}

              {/* One-time slots */}
              {oneTimeSlots.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 px-1 mb-1.5">One-time</p>
                  {oneTimeSlots.map((slot) => (
                    <div key={slot.id} draggable
                      onDragStart={() => {
                        dragPayload.current = {
                          type: "onetime", oneTimeId: slot.id,
                          title: slot.title, duration: slot.duration,
                          color: slot.color, priority: slot.priority,
                          description: slot.description, offsetMinutes: 0,
                        };
                      }}
                      onDragEnd={() => { dragPayload.current = null; setGhostPos(null); }}
                      className="group relative rounded-xl p-2.5 mb-1.5 cursor-grab active:cursor-grabbing border border-dashed border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 transition-all select-none"
                      style={{ borderLeftColor: slot.color, borderLeftWidth: 3, borderLeftStyle: "solid" }}>
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight line-clamp-2 flex-1">{slot.title}</p>
                        <button onClick={() => setOneTimeSlots((p) => p.filter((s) => s.id !== slot.id))}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-neutral-300 hover:text-red-400 transition-all shrink-0">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-neutral-400">{formatDuration(slot.duration)}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-500 font-medium">once</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  {oneTimeSlots.length > 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 px-1 mb-1.5">Templates</p>
                  )}
                  {templates.map((t) => (
                    <div key={t.id} className="mb-1.5">
                      {editingId === t.id ? (
                        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 p-3">
                          <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Edit Template</p>
                          <SessionForm
                            value={editForm} onChange={setEditForm}
                            onSubmit={() => handleSaveTemplateEdit(t.id)}
                            onCancel={() => { setEditingId(null); setEditError(""); }}
                            submitLabel="Save Changes" saving={editSaving} error={editError}
                          />
                          <button onClick={() => handleDeleteTemplate(t.id)}
                            className="w-full mt-2 py-1.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-xs font-medium transition-colors">
                            Delete Template
                          </button>
                        </div>
                      ) : (
                        <div
                          draggable
                          onDragStart={() => {
                            dragPayload.current = {
                              type: "template", templateId: t.id,
                              title: t.title, duration: t.duration,
                              color: t.color, priority: t.priority,
                              description: t.description, offsetMinutes: 0,
                            };
                          }}
                          onDragEnd={() => { dragPayload.current = null; setGhostPos(null); }}
                          onClick={() => {
                            setEditingId(t.id);
                            setEditForm({ title: t.title, duration: t.duration, priority: t.priority, color: t.color, description: t.description });
                            setEditError("");
                            setSidebarMode(null);
                          }}
                          className="group relative rounded-xl p-2.5 cursor-pointer border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 transition-all select-none hover:shadow-sm"
                          style={{ borderLeftColor: t.color, borderLeftWidth: 3 }}>
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight line-clamp-2 flex-1">{t.title}</p>
                            <svg className="w-3 h-3 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] text-neutral-400">{formatDuration(t.duration)}</span>
                            <span className="text-[10px] text-neutral-300 dark:text-neutral-600">·</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${t.priority === "mandatory" ? "bg-red-50 dark:bg-red-950 text-red-500" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}>
                              {t.priority}
                            </span>
                          </div>
                          <p className="text-[9px] text-neutral-300 dark:text-neutral-700 mt-1 group-hover:text-neutral-400 transition-colors">click to edit · drag to place</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {templates.length === 0 && oneTimeSlots.length === 0 && sidebarMode === null && (
                <div className="text-center py-8 px-2">
                  <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed">
                    Create a template above, then drag it onto the calendar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Timetable grid ──────────────────────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Time labels */}
            <div className="w-14 shrink-0 overflow-y-auto border-r border-neutral-100 dark:border-neutral-800"
              style={{ scrollbarWidth: "none" }} ref={scrollRef}
              onScroll={(e) => {
                const top = (e.currentTarget as HTMLDivElement).scrollTop;
                document.querySelectorAll(".day-col-scroll").forEach((el) => { (el as HTMLDivElement).scrollTop = top; });
              }}>
              <div className="relative" style={{ height: DAY_HEIGHT + 40 }}>
                <div style={{ height: 40 }} />
                {hourLabels.map((m) => (
                  <div key={m} className="absolute right-2 text-[10px] text-neutral-400 dark:text-neutral-600 select-none leading-none"
                    style={{ top: 40 + (m - GRID_START) * PX_PER_MIN - 5 }}>
                    {formatTime(m)}
                  </div>
                ))}
              </div>
            </div>

            {/* Day columns */}
            <div className="flex flex-1 overflow-x-auto">
              {DAYS.map((day, dayIndex) => {
                const date        = getDayDate(dayIndex);
                const isToday     = weekOffset === 0 && date.getTime() === today.getTime();
                const daySessions = scheduled.filter((s) => s.dayIndex === dayIndex);

                return (
                  <div key={day} className="flex flex-col flex-1 min-w-[90px] border-r border-neutral-100 dark:border-neutral-800 last:border-r-0">
                    <div className={`shrink-0 h-10 flex flex-col items-center justify-center border-b border-neutral-100 dark:border-neutral-800 ${isToday ? "bg-indigo-50 dark:bg-indigo-950/40" : ""}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-widest ${isToday ? "text-indigo-400" : "text-neutral-400 dark:text-neutral-600"}`}>{day}</p>
                      <p className={`text-sm font-bold leading-none ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-600 dark:text-neutral-400"}`}>{date.getDate()}</p>
                    </div>

                    <div
                      className="day-col-scroll flex-1 overflow-y-auto overflow-x-hidden relative"
                      style={{ scrollbarWidth: "none" }}
                      onScroll={(e) => {
                        const top = (e.currentTarget as HTMLDivElement).scrollTop;
                        if (scrollRef.current) scrollRef.current.scrollTop = top;
                        document.querySelectorAll(".day-col-scroll").forEach((el) => { if (el !== e.currentTarget) (el as HTMLDivElement).scrollTop = top; });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const rect   = e.currentTarget.getBoundingClientRect();
                        const relY   = e.clientY - rect.top + e.currentTarget.scrollTop;
                        const rawMin = GRID_START + relY / PX_PER_MIN;
                        const p      = dragPayload.current;
                        setGhostPos({
                          dayIndex,
                          minute: Math.max(GRID_START, Math.min(snapTo(rawMin - (p?.offsetMinutes ?? 0), SNAP), GRID_END - (p?.duration ?? 30))),
                        });
                      }}
                      onDragLeave={() => setGhostPos(null)}
                      onDrop={(e) => handleDrop(e, dayIndex)}
                    >
                      <div className="relative" style={{ height: DAY_HEIGHT }}>
                        {hourLabels.map((m) => (
                          <div key={m} className="absolute left-0 right-0 border-t border-neutral-100 dark:border-neutral-800" style={{ top: (m - GRID_START) * PX_PER_MIN }} />
                        ))}
                        {hourLabels.slice(0, -1).map((m) => (
                          <div key={`hh${m}`} className="absolute left-0 right-0 border-t border-dashed border-neutral-50 dark:border-neutral-900" style={{ top: (m + 30 - GRID_START) * PX_PER_MIN }} />
                        ))}

                        {isToday && (() => {
                          const now    = new Date();
                          const nowMin = now.getHours() * 60 + now.getMinutes();
                          if (nowMin < GRID_START || nowMin > GRID_END) return null;
                          return (
                            <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: (nowMin - GRID_START) * PX_PER_MIN }}>
                              <div className="w-2 h-2 rounded-full bg-indigo-500 -ml-1 shrink-0" />
                              <div className="flex-1 h-px bg-indigo-400 opacity-70" />
                            </div>
                          );
                        })()}

                        {dragPayload.current && ghostPos?.dayIndex === dayIndex && (
                          <div className="absolute left-1 right-1 rounded-lg pointer-events-none border-2 border-dashed border-white/50 opacity-60 z-10"
                            style={{
                              top: (ghostPos.minute - GRID_START) * PX_PER_MIN,
                              height: (dragPayload.current?.duration ?? 30) * PX_PER_MIN,
                              backgroundColor: dragPayload.current?.color ?? "#6366f1",
                            }} />
                        )}

                        {daySessions.map((session) => {
                          const top      = (session.startMinute - GRID_START) * PX_PER_MIN;
                          const height   = Math.max(session.duration * PX_PER_MIN, SNAP * PX_PER_MIN);
                          const conflict = hasConflict(scheduled, dayIndex, session.startMinute, session.duration, session.id);

                          return (
                            <div
                              key={session.id}
                              draggable
                              onDragStart={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                dragPayload.current = {
                                  type: "scheduled", sessionId: session.id,
                                  templateId: session.templateId,
                                  title: session.title, duration: session.duration,
                                  color: session.color, priority: session.priority,
                                  description: session.description,
                                  offsetMinutes: (e.clientY - rect.top) / PX_PER_MIN,
                                };
                              }}
                              onDragEnd={() => { dragPayload.current = null; setGhostPos(null); }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(session);
                                setEditingScheduled(false);
                                setScheduledEditForm({
                                  title: session.title, duration: session.duration,
                                  priority: session.priority, color: session.color,
                                  description: session.description,
                                });
                              }}
                              className={`absolute left-1 right-1 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing select-none overflow-hidden transition-shadow hover:shadow-lg z-10 ${conflict ? "ring-2 ring-red-400" : ""}`}
                              style={{
                                top, height,
                                backgroundColor: session.color + "55",
                                borderLeft: `3px solid ${session.color}`,
                              }}
                            >
                              <p className="text-[11px] font-bold leading-tight truncate" style={{ color: session.color }}>
                                {session.title}
                              </p>
                              {height > 38 && (
                                <p className="text-[10px] truncate mt-0.5" style={{ color: session.color, opacity: 0.75 }}>
                                  {formatTime(session.startMinute)}
                                </p>
                              )}
                              {session.status !== "planned" && height > 52 && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize font-semibold mt-0.5 inline-block ${STATUS_STYLES[session.status]}`}>
                                  {session.status}
                                </span>
                              )}
                              {conflict && <span className="absolute top-1 right-1 text-[10px]">⚠️</span>}
                              {session.templateId === "one-time" && height > 40 && (
                                <span className="absolute bottom-5 right-1.5 text-[8px] opacity-50" style={{ color: session.color }}>once</span>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center group/resize"
                                onMouseDown={(e) => handleResizeStart(e, session.id, session.duration)}>
                                <div className="w-8 h-0.5 rounded-full opacity-0 group-hover/resize:opacity-50 transition-opacity" style={{ backgroundColor: session.color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Session Detail / Edit Popup ──────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => { setSelected(null); setEditingScheduled(false); }}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5" style={{ backgroundColor: selected.color }} />
            <div className="p-5">
              {editingScheduled ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-base">Edit Session</h3>
                    <button onClick={() => setEditingScheduled(false)}
                      className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <SessionForm
                    value={scheduledEditForm} onChange={setScheduledEditForm}
                    onSubmit={() => handleSaveScheduledEdit(selected.id)}
                    onCancel={() => setEditingScheduled(false)}
                    submitLabel="Save Changes" saving={scheduledEditSaving} error={scheduledEditError}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-base leading-tight pr-4">{selected.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingScheduled(true)}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setSelected(null)}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {DAYS[selected.dayIndex]} · {formatTime(selected.startMinute)} – {formatTime(selected.startMinute + selected.duration)}
                    </span>
                    <span className="text-xs text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDuration(selected.duration)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selected.priority === "mandatory" ? "bg-red-50 dark:bg-red-950 text-red-500" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}>
                      {selected.priority}
                    </span>
                    {selected.templateId === "one-time" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-500 font-medium">one-time</span>
                    )}
                  </div>
                  {selected.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">{selected.description}</p>
                  )}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wide">Status</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["planned", "in-progress", "completed", "missed"] as Status[]).map((s) => (
                        <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                          className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors border font-medium ${selected.status === s ? `${STATUS_STYLES[s]} border-transparent` : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        router.push(`/pomodoro?label=${encodeURIComponent(selected.title)}&duration=${selected.duration}&sessionId=${selected.id}`);
                        handleStatusChange(selected.id, "in-progress");
                        setSelected(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Now
                    </button>
                    <button onClick={() => handleDeleteScheduled(selected.id)}
                      className="px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
