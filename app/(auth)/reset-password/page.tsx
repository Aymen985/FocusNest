"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword(email);
      setSuccess("Password reset email sent. Please check your inbox.");
      setEmail("");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(error.message || "Something went wrong.");
      }
    }

    setLoading(false);
  }

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Reset Password</h1>

      <form onSubmit={handleResetPassword}>
        <div style={{ marginBottom: "12px" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13 }}>
        <a href="/login" style={{ color: "#6c63ff", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>
            ← Back to sign in
        </a>
        </div>
    </div>
  );
}