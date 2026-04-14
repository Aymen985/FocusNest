"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const linkStyle: React.CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: "0.5rem",
  textDecoration: "none",
};

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        padding: "1rem 2rem",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <Link href="/" style={{ ...linkStyle, fontWeight: 700 }}>
        FocusNest
      </Link>
      <Link href="/pomodoro" style={linkStyle}>
        Pomodoro
      </Link>
      <Link href="/progress" style={linkStyle}>
        Progress
      </Link>
      <Link href="/assistant" style={linkStyle}>
        Assistant
      </Link>

      {/* Auth links — only render once auth state is known */}
      {!loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
          {user ? (
            <>
              <Link href="/profile" style={linkStyle}>
                Profile
              </Link>
              <button
                onClick={logout}
                style={{
                  ...linkStyle,
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={linkStyle}>
                Login
              </Link>
              <Link
                href="/signup"
                style={{
                  ...linkStyle,
                  background: "#6c63ff",
                  color: "#fff",
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}