"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGuest } from "@/context/GuestContext";
import LoadingScreen from "@/components/LoadingScreen";
import PomodoroWidget from "../components/PomodoroWidget";
import AssistantWidget from "../components/AssistantWidget";
import ForestWidget from "../components/ForestWidget";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { isGuest, hasVisited } = useGuest();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isGuest && hasVisited) router.push("/login");
  }, [user, loading, isGuest, hasVisited, router]);

  if (loading) return <LoadingScreen />;
  if (!user && !isGuest) return null;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 px-4 sm:px-6 py-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_minmax(340px,1.2fr)_minmax(300px,1fr)] gap-4 items-start">
          <PomodoroWidget />
          <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">AI Study Assistant</p>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">FocusNest</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Study with an AI assistant, with focus tools on the sides.
            </p>
            {isGuest && (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                Browsing as guest.{" "}
                <a href="/login" className="underline font-medium">Sign in</a> for full access.
              </p>
            )}
          </div>
          <ForestWidget />
        </div>
        {user ? (
          <AssistantWidget />
        ) : (
          <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
              AI Study Assistant is available to signed-in users only.
            </p>
            <a href="/login" className="inline-block px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
              Sign in to unlock
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
