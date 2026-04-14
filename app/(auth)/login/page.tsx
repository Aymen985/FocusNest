"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const loggedInUser = await login(email, password);

        if (!loggedInUser.emailVerified) {
        await signOut(auth);

        setError("Your email is not verified. Please check your inbox and verify your email before logging in.");
        setLoading(false);
        return;
        }

      router.push("/profile");
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(error.message || "Something went wrong.");
      }
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Login</h1>

      <form onSubmit={handleLogin}>
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

        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
        {info && <p style={{ color: "green", marginBottom: "12px" }}>{info}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>
            No account yet?{" "}
            <a href="/signup" style={{ color: "#6c63ff", textDecoration: "none", fontWeight: 500 }}>
              Create one
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