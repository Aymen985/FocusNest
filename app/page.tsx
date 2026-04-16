"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import PomodoroWidget from "../components/PomodoroWidget";
import AssistantWidget from "../components/AssistantWidget";
import ForestWidget from "../components/ForestWidget";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 sm:px-6 py-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Top row: Pomodoro | Hero | Forest */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_minmax(340px,1.2fr)_minmax(300px,1fr)] gap-4 items-start">
          <PomodoroWidget />

          {/* Hero card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">
              AI Study Assistant
            </p>
            <h1 className="text-3xl font-bold text-neutral-50 mb-2">FocusNest</h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Study with an AI assistant, with focus tools on the sides.
            </p>
          </div>

          <ForestWidget />
        </div>

        {/* Bottom row: full-width assistant */}
        <AssistantWidget />

      </div>
    </main>
  );
}
