"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { usePomodoroContext } from "@/context/PomodoroContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  let isActive = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = usePomodoroContext();
    isActive = ctx.isActive;
  } catch {}

  const navLinks = [
    { href: "/dashboard",  label: t.nav_dashboard },
    { href: "/pomodoro",   label: t.nav_pomodoro },
    { href: "/timetable",  label: t.nav_timetable },
    { href: "/forest",     label: t.nav_forest },
    { href: "/assistant",  label: t.nav_assistant },
    { href: "/flashcards", label: t.nav_flashcards },
    { href: "/documents",  label: t.nav_documents },
    { href: "/about",      label: t.nav_about },
  ];

  if (pathname === "/") return null;

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6">
      <div className="flex items-center justify-between h-16 max-w-[1400px] mx-auto gap-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-50 shrink-0">
          <img src="/icon.png" alt="" className="w-7 h-7 object-contain" />
          FocusNest
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={`relative px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                pathname === l.href
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}>
              {l.label}
              {l.href === "/pomodoro" && isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop: profile / login */}
        {user ? (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/profile"
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              {t.nav_profile}
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link href="/login"
              className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 transition-colors">
              {t.nav_login}
            </Link>
            <Link href="/signup"
              className="px-3 py-1.5 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
              {t.nav_signup}
            </Link>
          </div>
        )}

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors gap-1.5 shrink-0"
          aria-label="Toggle menu">
          <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 dark:border-neutral-800 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === l.href
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}>
              {l.label}
              {l.href === "/pomodoro" && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </Link>
          ))}

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2 space-y-1">
            {user ? (
              <Link href="/profile" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                {t.nav_profile}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 transition-colors">
                  {t.nav_login}
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white text-center transition-colors">
                  {t.nav_signup}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
