"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const linkStyle: React.CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: "0.5rem",
  textDecoration: "none",
};

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  async function handleLogout() {
    setShowLogoutConfirm(false); // add this line
    await logout();
    router.push("/login");
  }

  return (
    <>
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

        {!loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
            {user ? (
              <>
                <Link href="/profile" style={linkStyle}>
                  Profile
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
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

      {/* Logout confirm popup */}
      {showLogoutConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "#1a1a1a", padding: "2rem", borderRadius: "1rem",
            border: "1px solid rgba(255,255,255,0.1)", maxWidth: 320, width: "100%", textAlign: "center",
          }}>
            <p style={{ marginBottom: "1.5rem", fontSize: 16 }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={handleLogout}
                style={{ padding: "10px 24px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Yes, log out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: "10px 24px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer", background: "none" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}