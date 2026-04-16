"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <img src="/icon.png" alt="FocusNest" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              FocusNest
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Study Smarter. Focus Deeper.
            </p>
          </div>
        </div>

        {/* What is FocusNest */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            About
            <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
            FocusNest is an all-in-one study productivity app designed to help students stay focused,
            organised, and on top of their academic goals. It combines a Pomodoro timer, weekly
            timetable planner, AI-powered study assistant, flashcard generator, document manager,
            and progress tracker — all in one place.
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            The idea behind FocusNest is simple: studying is hard enough without having to juggle
            five different tools. Everything you need to plan, focus, and review is here, built to
            work together seamlessly.
          </p>
        </div>

        {/* Features */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            Features
            <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "⏱", title: "Pomodoro Timer",     desc: "Focus sessions with tree growth and forest collection" },
              { icon: "📅", title: "Timetable",          desc: "Drag & drop weekly schedule with session tracking" },
              { icon: "🤖", title: "AI Assistant",       desc: "Chat with your documents using AI" },
              { icon: "🃏", title: "Flashcards",         desc: "AI-generated study cards from your notes" },
              { icon: "📄", title: "Documents",          desc: "Upload and manage your study materials" },
              { icon: "📈", title: "Progress",           desc: "Charts, streaks, and session history" },
            ].map((f) => (
              <div key={f.title}
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                <span className="text-xl leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{f.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Made by */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            Made by
            <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
              🎓
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                3rd Year Computer Science Student
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Built as a final year project — a practical tool for students, by a student.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            Feedback
            <span className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
            Found a bug, have a suggestion, or just want to say hi? I'd love to hear from you.
          </p>
          <a
            href="mailto:aymenlfi97@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            aymenlfi97@gmail.com
          </a>
        </div>

        {/* Back */}
        <div className="text-center pt-2">
          <Link href="/" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
            ← Back to FocusNest
          </Link>
        </div>

      </div>
    </div>
  );
}
