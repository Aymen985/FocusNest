"use client";

import Link from "next/link";
import { useGuest } from "@/context/GuestContext";
import { useLanguage } from "@/context/LanguageContext";

export default function WelcomeModal() {
  const { showWelcome, continueAsGuest, dismissWelcome } = useGuest();
  const { t } = useLanguage();

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
        style={{ animation: "fn-pop 0.25s ease" }}>

        <style>{`
          @keyframes fn-pop {
            from { transform: scale(0.93); opacity: 0; }
            to   { transform: scale(1);    opacity: 1; }
          }
        `}</style>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <img src="/icon.png" alt="FocusNest" className="w-14 h-14 object-contain" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          {t.guest_welcome}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
          {t.guest_description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            onClick={dismissWelcome}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">
            {t.guest_signin}
          </Link>
          <Link
            href="/signup"
            onClick={dismissWelcome}
            className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium text-sm transition-colors">
            {t.guest_create}
          </Link>
          <button
            onClick={continueAsGuest}
            className="w-full py-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            {t.guest_continue}
          </button>
        </div>
      </div>
    </div>
  );
}
