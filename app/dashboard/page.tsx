"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Session {
  completedAt: Timestamp;
  duration?: number;
}

interface DocMeta {
  id: string;
  name: string;
  uploadedAt?: Timestamp;
}

type Status = "planned" | "in-progress" | "completed" | "missed";

interface ScheduledSession {
  id: string;
  title: string;
  duration: number;
  color: string;
  startMinute: number;
  status: Status;
  priority: string;
  description?: string;
}

// ─── Timetable helpers (mirrored from timetable/page.tsx) ─────────────────────

function getWeekKey(monday: Date): string {
  const y     = monday.getFullYear();
  const start = new Date(y, 0, 1);
  const week  = Math.ceil(
    ((monday.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7
  );
  return `${y}-${String(week).padStart(2, "0")}`;
}

function getMondayOfWeek(): Date {
  const now  = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(now);
  mon.setDate(now.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

/** 0 = Mon … 6 = Sun, matching timetable's dayIndex */
function getTodayIndex(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
        {label}
      </p>
      <p className={`text-3xl font-bold ${color ?? "text-neutral-900 dark:text-neutral-50"}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{sub}</p>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

const STATUS_STYLES: Record<Status, { pill: string; dot: string }> = {
  planned:       { pill: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400",    dot: "bg-neutral-300 dark:bg-neutral-600" },
  "in-progress": { pill: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",                dot: "bg-blue-400 animate-pulse" },
  completed:     { pill: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",     dot: "bg-emerald-400" },
  missed:        { pill: "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",                     dot: "bg-red-400" },
};

function TodaySessionRow({
  session,
  onStart,
}: {
  session: ScheduledSession;
  onStart: (s: ScheduledSession) => void;
}) {
  const style = STATUS_STYLES[session.status] ?? STATUS_STYLES.planned;
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
      {/* colour bar */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: session.color }}
      />

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
          {session.title}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          {formatTime(session.startMinute)} · {formatDuration(session.duration)}
        </p>
      </div>

      {/* status pill */}
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 flex items-center gap-1 ${style.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {session.status}
      </span>

      {/* start button — visible on hover or if in-progress */}
      {session.status !== "completed" && session.status !== "missed" && (
        <button
          onClick={() => onStart(session)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white"
          title="Start in Pomodoro"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [todaySlots, setTodaySlots] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const monday   = getMondayOfWeek();
    const weekKey  = getWeekKey(monday);
    const dayIndex = getTodayIndex();

    (async () => {
      const [sessSnap, docSnap, timetableSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "pomodoroSessions"),
            orderBy("completedAt", "desc"),
            limit(100)
          )
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "documents"),
            orderBy("uploadedAt", "desc"),
            limit(5)
          )
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "scheduledSessions"),
            where("weekKey", "==", weekKey),
            where("dayIndex", "==", dayIndex)
          )
        ),
      ]);

      setSessions(sessSnap.docs.map((d) => d.data() as Session));
      setDocs(docSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DocMeta, "id">) })));

      const slots: ScheduledSession[] = timetableSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ScheduledSession, "id">) }))
        .sort((a, b) => a.startMinute - b.startMinute);
      setTodaySlots(slots);

      setLoading(false);
    })();
  }, [user]);

  const totalMinutes = sessions.reduce((a, s) => a + (s.duration ?? 25), 0);
  const todaySessions = sessions.filter((s) => {
    const d   = s.completedAt.toDate();
    const now = new Date();
    return (
      d.getDate()     === now.getDate()  &&
      d.getMonth()    === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  // Derive first name: prefer Firestore profile, fall back to Firebase displayName
  const firstName =
    userProfile?.firstName ||
    user?.displayName?.split(" ")[0] ||
    "there";

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const completedToday = todaySlots.filter((s) => s.status === "completed").length;
  const totalToday     = todaySlots.length;

  function handleStartSession(session: ScheduledSession) {
    router.push(
      `/pomodoro?label=${encodeURIComponent(session.title)}&duration=${session.duration}&sessionId=${session.id}`
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Greeting ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard
                label="Today's sessions"
                value={todaySessions.toString()}
                sub={todaySessions === 1 ? "1 Pomodoro done" : `${todaySessions} Pomodoros done`}
                color={todaySessions > 0 ? "text-indigo-600 dark:text-indigo-400" : undefined}
              />
              <StatCard
                label="Total sessions"
                value={sessions.length.toString()}
                sub="all time"
              />
              <StatCard
                label="Focus time"
                value={`${Math.round(totalMinutes / 60)}h`}
                sub={`${totalMinutes} min total`}
              />
              <StatCard
                label="Documents"
                value={docs.length.toString()}
                sub="uploaded"
              />
            </div>

            {/* ── Main two-col layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left col: today's schedule + quick actions */}
              <div className="lg:col-span-2 space-y-6">

                {/* Today's timetable widget */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                      Today's schedule
                    </h2>
                    {totalToday > 0 && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {completedToday}/{totalToday} done
                      </span>
                    )}
                  </div>

                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                    {totalToday === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-2xl mb-2">📅</p>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Nothing scheduled today
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-3">
                          Add sessions to your timetable to see them here.
                        </p>
                        <Link
                          href="/timetable"
                          className="text-xs text-indigo-500 hover:underline"
                        >
                          Open timetable →
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Progress bar */}
                        {totalToday > 0 && (
                          <div className="px-4 pt-3 pb-2">
                            <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${(completedToday / totalToday) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {todaySlots.map((slot) => (
                            <TodaySessionRow
                              key={slot.id}
                              session={slot}
                              onStart={handleStartSession}
                            />
                          ))}
                        </div>

                        <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800">
                          <Link
                            href="/timetable"
                            className="text-xs text-indigo-500 hover:underline"
                          >
                            View full timetable →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick actions */}
                <div>
                  <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
                    Quick actions
                  </h2>
                  <div className="space-y-2">
                    <QuickAction
                      href="/pomodoro"
                      title="Start a focus session"
                      desc="Pomodoro timer with automatic session tracking"
                      icon={
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        </svg>
                      }
                    />
                    <QuickAction
                      href="/assistant"
                      title="Ask your study assistant"
                      desc="Chat with AI about your uploaded documents"
                      icon={
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      }
                    />
                    <QuickAction
                      href="/flashcards"
                      title="Generate flashcards"
                      desc="AI creates study cards from your notes"
                      icon={
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth={1.5} />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
                        </svg>
                      }
                    />
                    <QuickAction
                      href="/progress"
                      title="View progress"
                      desc="Charts, streaks, and session history"
                      icon={
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Right col: recent documents */}
              <div>
                <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
                  Recent documents
                </h2>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
                  {docs.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-neutral-400 dark:text-neutral-600 mb-3">
                        No documents yet
                      </p>
                      <Link href="/documents" className="text-xs text-indigo-500 hover:underline">
                        Upload your first file →
                      </Link>
                    </div>
                  ) : (
                    docs.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate" title={d.name}>
                          {d.name}
                        </p>
                      </div>
                    ))
                  )}
                  {docs.length > 0 && (
                    <div className="px-4 py-2.5">
                      <Link href="/documents" className="text-xs text-indigo-500 hover:underline">
                        View all documents →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
