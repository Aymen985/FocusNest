"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");

  const blockedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && user && !blockedRef.current) router.push("/");
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingScreen />;
  if (user && !blockedRef.current) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    blockedRef.current = false;

    try {
      const loggedInUser = await login(email, password);
      if (!loggedInUser.emailVerified) {
        blockedRef.current = true;
        await signOut(auth);
        setError("Email not verified. Please check your inbox before signing in.");
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else if (err.code === "auth/invalid-email")  setError("Invalid email address.");
      else setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-50 mb-1">Welcome back</h1>
      <p className="text-sm text-neutral-400 mb-7">Sign in to your FocusNest account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              Password
            </label>
            <Link href="/reset-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 pr-12 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-medium"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {info && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-2.5 transition-colors mt-1"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-6">
        No account?{" "}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </>
  );
}
