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
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

interface Session {
  completedAt: Timestamp;
  duration?: number;
}

interface DocMeta {
  id: string;
  name: string;
  uploadedAt?: Timestamp;
}

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
      <p
        className={`text-3xl font-bold ${color ?? "text-neutral-900 dark:text-neutral-50"}`}
      >
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
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {title}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [sessSnap, docSnap] = await Promise.all([
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
      ]);
      setSessions(sessSnap.docs.map((d) => d.data() as Session));
      setDocs(
        docSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DocMeta, "id">),
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  const totalMinutes = sessions.reduce((a, s) => a + (s.duration ?? 25), 0);
  const todaySessions = sessions.filter((s) => {
    const d = s.completedAt.toDate();
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
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
            {/* Stats row */}
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
                sub={`${totalMinutes} minutes total`}
              />
              <StatCard
                label="Documents"
                value={docs.length.toString()}
                sub="uploaded"
              />
            </div>

            {/* Two-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick actions */}
              <div className="lg:col-span-2 space-y-3">
                <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-3">
                  Quick actions
                </h2>
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
                  href="/documents"
                  title="Manage documents"
                  desc="Upload, view, and delete your study files"
                  icon={
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

              {/* Recent docs */}
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
                      <Link
                        href="/documents"
                        className="text-xs text-indigo-500 hover:underline"
                      >
                        Upload your first file →
                      </Link>
                    </div>
                  ) : (
                    docs.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3.5 h-3.5 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                        </div>
                        <p
                          className="text-sm text-neutral-700 dark:text-neutral-300 truncate"
                          title={d.name}
                        >
                          {d.name}
                        </p>
                      </div>
                    ))
                  )}
                  {docs.length > 0 && (
                    <div className="px-4 py-2.5">
                      <Link
                        href="/documents"
                        className="text-xs text-indigo-500 hover:underline"
                      >
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
