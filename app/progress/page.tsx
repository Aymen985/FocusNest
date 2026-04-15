"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface PomodoroSession {
  id: string;
  completedAt: Timestamp;
  duration: number;
  label?: string;
}

interface DayStat {
  date: string;
  sessions: number;
  minutes: number;
}

function getStreakInfo(sessions: PomodoroSession[]): {
  current: number;
  longest: number;
} {
  if (!sessions.length) return { current: 0, longest: 0 };

  const daySet = new Set<string>();
  sessions.forEach((s) => {
    const d = s.completedAt.toDate();
    daySet.add(d.toISOString().split("T")[0]);
  });

  const sortedDays = Array.from(daySet).sort();

  let longest = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
      if (tempStreak > longest) longest = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  const checkDay = new Date(today);
  while (true) {
    const key = checkDay.toISOString().split("T")[0];
    if (daySet.has(key)) {
      streak++;
      checkDay.setDate(checkDay.getDate() - 1);
    } else {
      break;
    }
  }

  return { current: streak, longest };
}

function getLast14Days(sessions: PomodoroSession[]): DayStat[] {
  const map: Record<string, DayStat> = {};
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    map[key] = { date: label, sessions: 0, minutes: 0 };
  }

  sessions.forEach((s) => {
    const key = s.completedAt.toDate().toISOString().split("T")[0];
    if (map[key]) {
      map[key].sessions++;
      map[key].minutes += s.duration ?? 25;
    }
  });

  return Object.values(map);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm shadow-lg">
        <p className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
          {label}
        </p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "pomodoroSessions"),
          orderBy("completedAt", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);
        const data: PomodoroSession[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PomodoroSession, "id">),
        }));
        setSessions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((a, s) => a + (s.duration ?? 25), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const { current: currentStreak, longest: longestStreak } =
    getStreakInfo(sessions);
  const chartData = getLast14Days(sessions);
  const avgDaily = (
    chartData.reduce((a, d) => a + d.sessions, 0) / 14
  ).toFixed(1);

  const stats = [
    { label: "Total sessions", value: totalSessions.toString() },
    { label: "Total hours studied", value: `${totalHours}h` },
    { label: "Current streak", value: `${currentStreak}d` },
    { label: "Longest streak", value: `${longestStreak}d` },
    { label: "Avg sessions / day", value: avgDaily },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Progress
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Your study sessions and focus streaks.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4"
                >
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 leading-tight">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-5">
                Sessions — last 14 days
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  barSize={14}
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
                  <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-5">
                Focus minutes — last 14 days
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="minutes" name="Minutes" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {sessions.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                  Recent sessions
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 10).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {s.label ?? "Focus session"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
                        <span>{s.duration ?? 25} min</span>
                        <span>
                          {s.completedAt.toDate().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <div className="text-center py-20 text-neutral-400 dark:text-neutral-600">
                <p className="text-4xl mb-3">🍅</p>
                <p className="text-sm">
                  No sessions yet. Complete a Pomodoro to start tracking.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}