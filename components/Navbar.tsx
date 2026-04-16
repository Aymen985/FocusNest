"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { usePomodoroContext } from "@/context/PomodoroContext";
import { useGuest, GUEST_ALLOWED } from "@/context/GuestContext";
import { getAvatar } from "@/components/avatars";
import { useLanguage, type Lang } from "@/context/LanguageContext";

export default function Navbar() {
  const { user, userProfile, logout, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isGuest } = useGuest();
  const { lang, t, setLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      root.removeAttribute("data-theme");
      localStorage.setItem("focusnest_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("focusnest_theme", "light");
    }
  }

  // Live timer indicator — won't crash if context not ready
  let isActive = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = usePomodoroContext();
    isActive = ctx.isActive;
  } catch {}

  async function handleLogout() {
    setShowLogoutConfirm(false);
    setMenuOpen(false);
    await logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/dashboard",  label: t.nav_dashboard },
    { href: "/pomodoro",   label: t.nav_pomodoro },
    { href: "/timetable",  label: t.nav_timetable },
    { href: "/forest",     label: t.nav_forest },
    { href: "/assistant",  label: t.nav_assistant },
    { href: "/flashcards", label: t.nav_flashcards },
    { href: "/documents",  label: t.nav_documents },
    { href: "/about",       label: t.nav_about },
  ];

  return (
    <>
      <nav className="relative border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 max-w-6xl mx-auto">

          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-50 shrink-0">
            <img src="/icon.png" alt="" className="w-7 h-7 object-contain" />
            FocusNest
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const blocked = isGuest && !GUEST_ALLOWED.includes(l.href);
              const href = blocked ? `/login?reason=guest` : l.href;
              return (
                <Link key={l.href} href={href}
                  className={`relative px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === l.href
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  } ${blocked ? "opacity-50" : ""}`}>
                  {l.label}
                  {blocked && <span className="ml-1 text-[9px] text-neutral-400">🔒</span>}
                  {l.href === "/pomodoro" && isActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop auth */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    {userProfile?.avatar ? (
                      <span className="w-5 h-5 rounded-full overflow-hidden inline-flex"
                        dangerouslySetInnerHTML={{ __html: getAvatar(userProfile.avatar).svg }} />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-[9px] font-bold text-emerald-600">
                        {(userProfile?.firstName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                    {t.nav_profile}
                  </Link>
                  <button onClick={() => setShowLogoutConfirm(true)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup"
                    className="px-3 py-1.5 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                    {t.nav_signup}
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Language switcher */}
          <div className="hidden md:flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            {(["en", "fr", "ar"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                  lang === l
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Burger */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors gap-1.5"
            aria-label="Toggle menu">
            <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-neutral-600 dark:bg-neutral-300 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-neutral-100 dark:border-neutral-800 py-3 space-y-1">
            {navLinks.map((l) => {
              const blocked = isGuest && !GUEST_ALLOWED.includes(l.href);
              const href = blocked ? `/login?reason=guest` : l.href;
              return (
                <Link key={l.href} href={href} onClick={() => setMenuOpen(false)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === l.href
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  } ${blocked ? "opacity-50" : ""}`}>
                  {l.label}
                  {blocked && <span className="text-[9px] text-neutral-400">🔒</span>}
                  {l.href === "/pomodoro" && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                </Link>
              );
            })}
            {!loading && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2 space-y-1">
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      {userProfile?.avatar ? (
                        <span className="w-5 h-5 rounded-full overflow-hidden inline-flex"
                          dangerouslySetInnerHTML={{ __html: getAvatar(userProfile.avatar).svg }} />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-[9px] font-bold text-emerald-600">
                          {(userProfile?.firstName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
                        </span>
                      )}
                      {t.nav_profile}
                    </Link>
                    <button onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 transition-colors">
                      Login
                    </Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white text-center transition-colors">
                      {t.nav_signup}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a1a", padding: "2rem", borderRadius: "1rem",
            border: "1px solid rgba(255,255,255,0.1)", maxWidth: 320, width: "100%", textAlign: "center" }}>
            <p style={{ marginBottom: "1.5rem", fontSize: 16, color: "#fff" }}>
              {t.logout_confirm}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={handleLogout}
                style={{ padding: "10px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                Yes, log out
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: "10px 24px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer", background: "none", color: "#fff" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
