"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES, FlagImg } from "@/context/LanguageContext";
import { usePomodoroContext } from "@/context/PomodoroContext";
import { getAvatar } from "@/components/avatars";

const NAV_LINKS = [
  { href: "/dashboard",  label: "nav_dashboard"  as const, icon: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" },
  { href: "/pomodoro",   label: "nav_pomodoro"   as const, icon: "M12 3a9 9 0 100 18A9 9 0 0012 3zm0 4v5l3 3", dot: true },
  { href: "/timetable",  label: "nav_timetable"  as const, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/forest",     label: "nav_forest"     as const, icon: "M12 2L7 9h3.5l-2 6h3L10 22h4l-1.5-7h3l-2-6H17L12 2z" },
  { href: "/assistant",  label: "nav_assistant"  as const, icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { href: "/flashcards", label: "nav_flashcards" as const, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/documents",  label: "nav_documents"  as const, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/about",      label: "nav_about"      as const, icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

interface LangDropdownProps {
  lang: string;
  setLang: (l: any) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

function SidebarLanguageBlock({ lang, setLang, isDark, toggleTheme }: LangDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 space-y-0.5 shrink-0">
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <FlagImg countryCode={currentLang.countryCode} />
          <span className="flex-1 text-left truncate">{currentLang.nativeName}</span>
          <svg
            className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  lang === l.code
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <FlagImg countryCode={l.countryCode} />
                <span>{l.nativeName}</span>
                {lang === l.code && (
                  <svg className="w-3.5 h-3.5 ml-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {isDark ? (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.02 0-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, userProfile, logout, loading } = useAuth();
  const { t, lang, setLang } = useLanguage();

  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [isDark,            setIsDark]            = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileOpen,        setMobileOpen]        = useState(false);

  let isActive = false;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = usePomodoroContext();
    isActive = ctx.isActive;
  } catch {}

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("focusnest_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("focusnest_theme", "light");
    }
  }

  async function handleLogout() {
    setShowLogoutConfirm(false);
    await logout();
    router.push("/login");
  }

  // Auth pages: no shell
  const authPaths = ["/login", "/signup", "/reset-password"];
  if (authPaths.some((p) => pathname.startsWith(p))) return <>{children}</>;

  // Redirect unauthenticated users to login
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  function SidebarNav() {
    return (
      <div className="flex flex-col h-full w-56 min-w-[14rem]">

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 shrink-0">
            {userProfile?.avatar ? (
              <span className="w-8 h-8 rounded-full overflow-hidden inline-flex shrink-0"
                dangerouslySetInnerHTML={{ __html: getAvatar(userProfile.avatar).svg }} />
            ) : (
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-sm font-bold text-emerald-600 shrink-0">
                {(userProfile?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {userProfile?.firstName
                  ? `${userProfile.firstName} ${userProfile.lastName ?? ""}`.trim()
                  : user.email}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon, dot }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}>
                <NavIcon d={icon} />
                <span className="truncate">{t[label]}</span>
                {dot && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <SidebarLanguageBlock
          lang={lang}
          setLang={setLang}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-950 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-56" : "w-0"
      }`}>
        <SidebarNav />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarNav />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        <header className="flex items-center h-14 px-3 sm:px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 gap-2">

          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors shrink-0"
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/icon.png" alt="" className="w-7 h-7 object-contain" />
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-50">FocusNest</span>
          </Link>

          <span className="text-neutral-300 dark:text-neutral-600 hidden sm:block">/</span>
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hidden sm:block capitalize truncate">
            {pathname === "/" ? "Home" : pathname.slice(1).replace(/-/g, " ")}
          </span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {!loading && user && (
              <>
                <Link href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  {userProfile?.avatar ? (
                    <span className="w-5 h-5 rounded-full overflow-hidden inline-flex shrink-0"
                      dangerouslySetInnerHTML={{ __html: getAvatar(userProfile.avatar).svg }} />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-[9px] font-bold text-emerald-600">
                      {(userProfile?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                  <span className="hidden sm:inline">{t.nav_profile}</span>
                </Link>
                <button onClick={() => setShowLogoutConfirm(true)}
                  className="px-3 py-1.5 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  {t.nav_logout}
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-xs w-full text-center shadow-2xl">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-5">
              {t.logout_confirm}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleLogout}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
                {t.logout_yes}
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 text-sm rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                {t.btn_cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
