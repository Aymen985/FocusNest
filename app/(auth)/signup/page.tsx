"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone: string) {
  return /^\+\d{1,4}[\s\-]?\d{4,14}$/.test(phone);
}
function validatePassword(pw: string) {
  if (pw.length < 6) return "Password must be at least 6 characters.";
  return "";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition";

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");
  const [dob, setDob]                       = useState("");
  const [major, setMajor]                   = useState("");
  const [phone, setPhone]                   = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState("");

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingScreen />;
  if (user) return null;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email))  { setError("Invalid email format."); return; }
    if (!validatePhone(phone))  { setError("Invalid phone — use: +XX XXXXXXXXX"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }

    setLoading(true);
    try {
      await signup(email, password, { firstName, lastName, dob, major, phone });
      setSuccess("Account created! Verify your email then sign in.");
      setFirstName(""); setLastName(""); setDob("");
      setMajor(""); setPhone(""); setEmail("");
      setPassword(""); setConfirmPassword("");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("This email is already in use.");
      else if (err.code === "auth/invalid-email")   setError("Invalid email address.");
      else if (err.code === "auth/weak-password")   setError("Password is too weak.");
      else setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-neutral-50 mb-1">Create account</h1>
      <p className="text-sm text-neutral-400 mb-7">Start building your focus forest 🌳</p>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              className={inputCls}
              placeholder="Ada"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls}
              placeholder="Lovelace"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Date of birth">
          <input
            type="date"
            className={inputCls + " dark:[color-scheme:dark]"}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </Field>

        <Field label="Major / Subject">
          <input
            className={inputCls}
            placeholder="e.g. Computer Science"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
          />
        </Field>

        <Field label="Phone">
          <input
            className={inputCls}
            placeholder="+44 7700 000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className={inputCls + " pr-12"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-medium"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <Field label="Confirm password">
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={inputCls + " pr-12"}
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-medium"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        {/* Messages */}
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-neutral-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}
