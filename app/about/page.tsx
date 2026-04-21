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
              An integrated study productivity platform for focused, structured learning
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
            FocusNest is a web-based study platform designed to help students manage their time,
            stay focused, and revise more effectively within a single environment. Instead of
            relying on separate tools for timing, note-based revision, AI support, and progress
            tracking, FocusNest brings these functions together into one connected workspace.
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            The platform was developed to address common study problems such as procrastination,
            fragmented workflows, loss of focus, and the interruption caused by switching between
            multiple apps while studying. By combining productivity tools with AI-assisted support,
            FocusNest aims to make independent study more structured, practical, and engaging.
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
              { icon: "⏱", title: "Pomodoro Timer", desc: "Run focused study sessions with built-in work and break cycles, designed to support concentration and reduce distraction.", href: "/pomodoro" },
              { icon: "📅", title: "Timetable",      desc: "Plan and organise study sessions across the week using a dedicated scheduling space.", href: "/timetable" },
              { icon: "🤖", title: "AI Assistant",   desc: "Ask study-related questions and receive immediate support while working, without leaving the platform.", href: "/assistant" },
              { icon: "🃏", title: "Flashcards",     desc: "Generate revision flashcards from study material to support recall and active learning.", href: "/flashcards" },
              { icon: "📄", title: "Documents",      desc: "Upload and manage study documents for use across revision and AI-supported features.", href: "/documents" },
              { icon: "📈", title: "Progress",       desc: "Review study activity, session history, and visual progress over time.", href: "/forest" },
            ].map((f) => (
              <Link key={f.title} href={f.href}
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors group">
                <span className="text-xl leading-none mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{f.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{f.desc}</p>
                </div>
              </Link>
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
                Aymen Laoufi
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Final Year Project in Computer Science at the University of Westminster.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                FocusNest was created as a practical response to the difficulties students face when
                trying to balance productivity, revision, and academic support in digital study environments.
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
            If you notice a bug, have a suggestion, or would like to share feedback on the platform, please get in touch at:
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
