"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^\+\d{1,4}[\s\-]?\d{4,14}$/.test(phone);
}

function validatePassword(password: string) {
  if (password.length < 6) return "Password must be at least 6 characters.";
  return "";
}

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [major, setMajor] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingScreen />;
  if (user) return null;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validations
    if (!validateEmail(email)) {
      setError("Invalid email format. Use: example@domain.com");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Invalid phone format. Use: +XX XXXXXXXXX");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, { firstName, lastName, dob, major, phone });
      setSuccess("Account created! A verification email has been sent. Please verify before logging in.");
      setFirstName(""); setLastName(""); setDob("");
      setMajor(""); setPhone(""); setEmail("");
      setPassword(""); setConfirmPassword("");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") setError("This email is already in use.");
      else if (error.code === "auth/invalid-email") setError("Invalid email address.");
      else if (error.code === "auth/weak-password") setError("Password is too weak.");
      else setError(error.message || "Something went wrong.");
    }
    setLoading(false);
  }

  const inputStyle = { width: "100%", padding: "10px", boxSizing: "border-box" as const };
  const rowStyle = { marginBottom: "12px" };

  return (
    <div>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Sign Up</h1>

      <form onSubmit={handleSignup}>
        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={rowStyle}>
          <label style={{ fontSize: 12, opacity: 0.7, display: "block", marginBottom: 4 }}>
            Date of birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={rowStyle}>
          <input
            placeholder="Major (e.g. Computer Science)"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={rowStyle}>
          <input
            placeholder="Phone (+XX XXXXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div style={rowStyle}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Password with show/hide */}
        <div style={{ ...rowStyle, position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer", fontSize: 13, opacity: 0.7,
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm password with show/hide */}
        <div style={{ ...rowStyle, position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)", background: "none",
              border: "none", cursor: "pointer", fontSize: 13, opacity: 0.7,
            }}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px" }}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: "center", fontSize: 13 }}>
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