"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth(); // added user + authLoading
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auth guards — after all hooks, before everything else
  if (authLoading) return <LoadingScreen />;
  if (user) {
    router.push("/dashboard");
    return null;
  }

  function validatePassword(password: string) {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return "";
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      await signup(email, password);
      setSuccess(
        "Account created successfully. A verification email has been sent. Please verify your email before using your account."
      );

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError(error.message || "Something went wrong.");
      }
    }

    setLoading(false);
  }

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "12px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
        <p>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#6c63ff", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </a>
        </p>
        <p style={{ marginTop: 6 }}>
          Forgot your password?{" "}
          <a href="/reset-password" style={{ color: "#6c63ff", textDecoration: "none", fontWeight: 500 }}>
            Reset it
          </a>
        </p>
      </div>
    </div>
  );
}