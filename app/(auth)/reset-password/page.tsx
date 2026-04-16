"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await resetPassword(email);
      setSuccess("Reset email sent — check your inbox.");
      setEmail("");
    } catch (err: any) {
      if (err.code === "auth/user-not-found")  setError("No account found with that email.");
      else if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-50 mb-1">Reset password</h1>
      <p className="text-sm text-neutral-400 mb-7">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleReset} className="space-y-4">
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

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            ✓ {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-6">
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}
