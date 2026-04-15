"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { usePomodoroContext } from "@/context/PomodoroContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    { href: "/dashboard",  label: "Dashboard" },
    { href: "/pomodoro",   label: "Pomodoro" },
    { href: "/timetable",  label: "Timetable" },
    { href: "/progress",   label: "Progress" },
    { href: "/assistant",  label: "Assistant" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/documents",  label: "Documents" },
  ];

  return (
    <>
      <nav className="relative border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 max-w-6xl mx-auto">

          <Link href="/" className="font-bold text-lg text-neutral-900 dark:text-neutral-50 shrink-0">
            FocusNest
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className={`relative px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}>
                {l.label}
                {/* Live indicator on Pomodoro link */}
                {l.href === "/pomodoro" && isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/profile"
                    className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    Profile
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
                    className="px-3 py-1.5 rounded-lg text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}

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
            {!loading && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2 space-y-1">
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      Profile
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
                      className="block px-3 py-2 rounded-lg text-sm bg-indigo-500 hover:bg-indigo-600 text-white text-center transition-colors">
                      Sign up
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
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={handleLogout}
                style={{ padding: "10px 24px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
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
