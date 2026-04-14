"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/userProfile";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProfilePage() {
  const { user, userProfile, logout, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [major, setMajor] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Logout confirm
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setMajor(userProfile.major || "");
      setPhone(userProfile.phone || "");
    }
  }, [userProfile]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      await updateUserProfile(user!.uid, { firstName, lastName, major, phone });
      setSaveMsg("Profile updated successfully.");
    } catch {
      setSaveMsg("Failed to update profile.");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMsg("");
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password") setPasswordMsg("Current password is incorrect.");
      else if (err.code === "auth/weak-password") setPasswordMsg("New password is too weak.");
      else setPasswordMsg("Failed to change password.");
    }
    setChangingPassword(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const inputStyle = { width: "100%", padding: "10px", marginBottom: "12px", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>My Profile</h1>

      {/* Profile info */}
      <form onSubmit={handleSaveProfile}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ padding: "10px" }}
          />
          <input
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ padding: "10px" }}
          />
        </div>
        <input
          placeholder="Major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Phone (+XX XXXXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
        <p style={{ marginBottom: "12px", opacity: 0.7 }}>
          <strong>Email:</strong> {user.email}
        </p>
        {userProfile && (
          <p style={{ marginBottom: "12px", opacity: 0.7 }}>
            <strong>Trees:</strong> {userProfile.treeCount} &nbsp;|&nbsp;
            <strong>Sessions:</strong> {userProfile.totalSessions}
          </p>
        )}
        {saveMsg && <p style={{ color: saveMsg.includes("success") ? "green" : "red", marginBottom: "12px" }}>{saveMsg}</p>}
        <button type="submit" disabled={saving} style={{ padding: "10px 20px", marginBottom: "2rem" }}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Change password */}
      <h2 style={{ fontSize: "18px", marginBottom: "1rem" }}>Change password</h2>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="New password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {passwordMsg && <p style={{ color: passwordMsg.includes("success") ? "green" : "red", marginBottom: "12px" }}>{passwordMsg}</p>}
        <button type="submit" disabled={changingPassword} style={{ padding: "10px 20px", marginBottom: "2rem" }}>
          {changingPassword ? "Changing..." : "Change password"}
        </button>
      </form>

      {/* Logout */}
      <div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer", background: "none" }}
        >
          Logout
        </button>
      </div>

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
            <p style={{ marginBottom: "1.5rem", fontSize: 16 }}>Are you sure you want to log out?</p>
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
    </div>
  );
}