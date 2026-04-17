"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/userProfile";
import LoadingScreen from "@/components/LoadingScreen";
import { AVATARS, getAvatar, type AvatarId } from "@/components/avatars";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* --- helpers ------------------------------------------------ */
function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

// Password validation rules
interface PwRule { label: string; pass: (pw: string) => boolean; }
const PW_RULES: PwRule[] = [
  { label: "At least 8 characters",            pass: (pw) => pw.length >= 8 },
  { label: "At least one uppercase letter",    pass: (pw) => /[A-Z]/.test(pw) },
  { label: "At least one lowercase letter",    pass: (pw) => /[a-z]/.test(pw) },
  { label: "At least one number",              pass: (pw) => /[0-9]/.test(pw) },
  { label: "At least one special character",   pass: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PW_RULES.filter((r) => r.pass(password)).length;
  const pct = (passed / PW_RULES.length) * 100;
  const color = passed <= 2 ? "#ef4444" : passed <= 3 ? "#f59e0b" : "#10b981";
  const label = passed <= 2 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--fn-ink-subtle)", fontFamily: "Arial, sans-serif" }}>
          Password strength
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color, fontFamily: "Arial, sans-serif" }}>
          {label}
        </span>
      </div>
      <div style={{ height: 4, background: "var(--fn-border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.3s ease, background 0.3s ease" }} />
      </div>
      <ul style={{ listStyle: "none", margin: "0.5rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {PW_RULES.map((r) => {
          const ok = r.pass(password);
          return (
            <li key={r.label} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: ok ? "#10b981" : "var(--fn-ink-subtle)", fontFamily: "Arial, sans-serif" }}>
              <span style={{ fontSize: "0.65rem" }}>{ok ? "&#10003;" : "&#9675;"}</span>
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatPill({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="fn-stat-pill">
      <span className="fn-stat-icon">{icon}</span>
      <div>
        <p className="fn-stat-value">{value}</p>
        <p className="fn-stat-label">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fn-card">
      <h2 className="fn-card-title">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="fn-field">
      <label className="fn-label">{label}</label>
      {children}
    </div>
  );
}

function StatusMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  const ok = msg.toLowerCase().includes("success");
  return (
    <p className={`fn-status ${ok ? "fn-status--ok" : "fn-status--err"}`}>
      {ok ? "\u2713" : "\u26a0"} {msg}
    </p>
  );
}

/* --- main page ---------------------------------------------- */
export default function ProfilePage() {
  const { user, userProfile, logout, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [major,     setMajor]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [avatarId,  setAvatarId]  = useState<AvatarId | "">("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");

  const [currentPassword,  setCurrentPassword]  = useState("");
  const [newPassword,      setNewPassword]       = useState("");
  const [confirmPassword,  setConfirmPassword]   = useState("");
  const [showCurrentPw,    setShowCurrentPw]     = useState(false);
  const [showNewPw,        setShowNewPw]         = useState(false);
  const [showConfirmPw,    setShowConfirmPw]      = useState(false);
  const [passwordMsg,      setPasswordMsg]       = useState("");
  const [changingPassword, setChangingPassword]  = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted,           setMounted]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName  || "");
      setMajor(userProfile.major        || "");
      setPhone(userProfile.phone        || "");
      setAvatarId((userProfile.avatar as AvatarId) || "");
    }
  }, [userProfile]);

  if (loading) return <LoadingScreen />;
  if (!user)   return null;

  async function handleSaveAvatar(id: AvatarId) {
    setAvatarId(id);
    setShowAvatarPicker(false);
    setSavingAvatar(true);
    try {
      await updateDoc(doc(db, "users", user!.uid), { avatar: id });
    } catch (e) { console.error(e); }
    setSavingAvatar(false);
  }

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

  // Validate password rules client-side before submitting
  function validateNewPassword(pw: string): string | null {
    for (const rule of PW_RULES) {
      if (!rule.pass(pw)) return `Password does not meet: "${rule.label}"`;
    }
    return null;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");

    // Client-side checks
    if (!currentPassword) { setPasswordMsg("Please enter your current password."); return; }
    const validationError = validateNewPassword(newPassword);
    if (validationError) { setPasswordMsg(validationError); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg("New passwords do not match."); return; }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        setPasswordMsg("Current password is incorrect.");
      else if (err.code === "auth/weak-password")
        setPasswordMsg("Password is too weak. Please choose a stronger one.");
      else
        setPasswordMsg("Failed to change password. Please try again.");
    }
    setChangingPassword(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  // Group avatars for the picker
  const humanAvatars = AVATARS.filter((a) => a.id === "male" || a.id === "female");
  const funAvatars   = AVATARS.filter((a) => a.id !== "male" && a.id !== "female");

  return (
    <>
      <style>{`
        :root {
          --fn-parchment:   #f9fafb;
          --fn-paper:       #ffffff;
          --fn-ink:         #111111;
          --fn-ink-muted:   #4b5563;
          --fn-ink-subtle:  #9ca3af;
          --fn-terra:       #10b981;
          --fn-terra-light: rgba(16,185,129,0.12);
          --fn-sage:        #10b981;
          --fn-sage-light:  rgba(16,185,129,0.10);
          --fn-border:      #e5e7eb;
          --fn-shadow:      0 2px 12px rgba(0,0,0,0.07);
        }
        .dark {
          --fn-parchment:   #111111;
          --fn-paper:       #1a1a1a;
          --fn-ink:         #f0f0f0;
          --fn-ink-muted:   #a0a0a0;
          --fn-ink-subtle:  #606060;
          --fn-terra:       #10b981;
          --fn-terra-light: rgba(16,185,129,0.15);
          --fn-sage:        #10b981;
          --fn-sage-light:  rgba(16,185,129,0.12);
          --fn-border:      rgba(255,255,255,0.08);
          --fn-shadow:      0 2px 16px rgba(0,0,0,0.4);
        }
        .fn-page {
          min-height: 100vh;
          background: var(--fn-parchment);
          color: var(--fn-ink);
          padding: 2.5rem 1rem 4rem;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .fn-page.fn-mounted { opacity: 1; transform: translateY(0); }
        .fn-inner { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        .fn-hero {
          background: var(--fn-paper); border: 1px solid var(--fn-border);
          border-radius: 20px; box-shadow: var(--fn-shadow);
          padding: 2rem; display: flex; flex-direction: column;
          align-items: center; gap: 1rem; text-align: center;
        }
        .fn-avatar-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: conic-gradient(var(--fn-terra) 0deg 120deg, var(--fn-sage) 120deg 240deg, #c4a86b 240deg 360deg);
          padding: 3px; flex-shrink: 0;
        }
        .fn-avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: var(--fn-paper); display: flex;
          align-items: center; justify-content: center;
          font-size: 1.75rem; font-weight: 700; color: var(--fn-terra);
          letter-spacing: -1px;
        }
        .fn-hero-name { font-size: 1.35rem; font-weight: 700; color: var(--fn-ink); line-height: 1.2; }
        .fn-hero-email { font-size: 0.82rem; color: var(--fn-ink-subtle); font-family: 'Courier New', monospace; margin-top: -0.25rem; }
        .fn-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem; }
        .fn-stat-pill {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--fn-parchment); border: 1px solid var(--fn-border);
          border-radius: 999px; padding: 0.4rem 0.9rem;
        }
        .fn-stat-icon { font-size: 1rem; }
        .fn-stat-value { font-size: 0.95rem; font-weight: 700; color: var(--fn-ink); line-height: 1.1; margin: 0; }
        .fn-stat-label { font-size: 0.68rem; color: var(--fn-ink-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
        .fn-card {
          background: var(--fn-paper); border: 1px solid var(--fn-border);
          border-radius: 16px; box-shadow: var(--fn-shadow); padding: 1.75rem;
        }
        .fn-card-title {
          font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--fn-ink-subtle);
          margin: 0 0 1.25rem; display: flex; align-items: center; gap: 0.4rem;
        }
        .fn-card-title::after { content: ''; flex: 1; height: 1px; background: var(--fn-border); }
        .fn-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 480px) { .fn-grid2 { grid-template-columns: 1fr; } }
        .fn-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.75rem; }
        .fn-label { font-size: 0.72rem; font-weight: 600; color: var(--fn-ink-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .fn-input {
          background: var(--fn-parchment); border: 1.5px solid var(--fn-border);
          border-radius: 10px; padding: 0.6rem 0.85rem; font-size: 0.92rem;
          color: var(--fn-ink); width: 100%; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none;
        }
        .fn-input::placeholder { color: var(--fn-ink-subtle); }
        .fn-input:focus { border-color: var(--fn-terra); box-shadow: 0 0 0 3px var(--fn-terra-light); }
        .fn-input:disabled { opacity: 0.55; cursor: not-allowed; }
        .fn-pw-wrap { position: relative; }
        .fn-pw-wrap .fn-input { padding-right: 2.5rem; }
        .fn-pw-toggle {
          position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--fn-ink-subtle);
          padding: 0; display: flex; align-items: center;
        }
        .fn-pw-toggle:hover { color: var(--fn-ink); }
        .fn-email-row {
          display: flex; align-items: center; gap: 0.5rem;
          background: var(--fn-parchment); border: 1.5px solid var(--fn-border);
          border-radius: 10px; padding: 0.6rem 0.85rem;
          font-size: 0.88rem; color: var(--fn-ink-muted); font-family: 'Courier New', monospace;
        }
        .fn-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.4rem; padding: 0.6rem 1.4rem; border-radius: 10px;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          transition: all 0.18s ease; border: none; letter-spacing: 0.01em;
        }
        .fn-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .fn-btn-primary { background: var(--fn-terra); color: #fff; }
        .fn-btn-primary:not(:disabled):hover { background: #0d9467; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.35); }
        .fn-btn-outline { background: transparent; border: 1.5px solid var(--fn-border); color: var(--fn-ink-muted); }
        .fn-btn-outline:not(:disabled):hover { border-color: var(--fn-ink-muted); color: var(--fn-ink); }
        .fn-btn-danger { background: transparent; border: 1.5px solid rgba(255,100,80,0.35); color: #ff6e50; }
        .fn-btn-danger:hover { background: rgba(255,100,80,0.1); border-color: #ff6e50; }
        .fn-status { font-size: 0.82rem; padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.75rem; font-weight: 500; }
        .fn-status--ok  { background: var(--fn-sage-light); color: var(--fn-sage); }
        .fn-status--err { background: rgba(239,68,68,0.1); color: #ef4444; }
        .fn-divider { height: 1px; background: var(--fn-border); margin: 1.25rem 0; }
        .fn-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 200; padding: 1rem;
        }
        .fn-modal {
          background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 2rem; max-width: 340px; width: 100%;
          text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: fn-pop 0.2s ease;
        }
        @keyframes fn-pop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .fn-modal-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .fn-modal-title { font-size: 1.1rem; font-weight: 700; color: var(--fn-ink); margin-bottom: 0.4rem; }
        .fn-modal-body { font-size: 0.85rem; color: var(--fn-ink-muted); margin-bottom: 1.5rem; line-height: 1.5; }
        .fn-modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
      `}</style>

      <div className={`fn-page${mounted ? " fn-mounted" : ""}`}>
        <div className="fn-inner">

          {/* ── Hero ── */}
          <div className="fn-hero" style={{ position: "relative" }}>
            <div
              className="fn-avatar-ring"
              style={{ cursor: "pointer", position: "relative" }}
              onClick={() => setShowAvatarPicker((v) => !v)}
            >
              {avatarId ? (
                <div className="fn-avatar-inner" style={{ padding: 0, overflow: "hidden" }}
                  dangerouslySetInnerHTML={{ __html: getAvatar(avatarId).svg }} />
              ) : (
                <div className="fn-avatar-inner">{initials(firstName, lastName)}</div>
              )}
              {/* Pencil edit badge — no emoji */}
              <span style={{
                position: "absolute", bottom: 2, right: 2,
                background: "#10b981", borderRadius: "50%",
                width: 20, height: 20, display: "flex", alignItems: "center",
                justifyContent: "center", border: "2px solid var(--fn-paper)",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </span>
            </div>

            {/* Avatar picker */}
            {showAvatarPicker && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: "50%",
                transform: "translateX(-50%)",
                background: "var(--fn-paper)", border: "1px solid var(--fn-border)",
                borderRadius: 16, padding: "1rem", zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 300,
              }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--fn-ink-subtle)", marginBottom: "0.5rem" }}>
                  People
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
                  {humanAvatars.map((a) => (
                    <div key={a.id} onClick={() => handleSaveAvatar(a.id as AvatarId)}
                      title={a.label}
                      style={{
                        width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
                        border: avatarId === a.id ? "2.5px solid #10b981" : "2.5px solid transparent",
                        overflow: "hidden", transition: "border-color 0.15s, transform 0.15s",
                        transform: avatarId === a.id ? "scale(1.08)" : "scale(1)",
                      }}
                      dangerouslySetInnerHTML={{ __html: a.svg }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--fn-ink-subtle)", marginBottom: "0.5rem" }}>
                  Fun &amp; Cartoon
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {funAvatars.map((a) => (
                    <div key={a.id} onClick={() => handleSaveAvatar(a.id as AvatarId)}
                      title={a.label}
                      style={{
                        width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
                        border: avatarId === a.id ? "2.5px solid #10b981" : "2.5px solid transparent",
                        overflow: "hidden", transition: "border-color 0.15s, transform 0.15s",
                        transform: avatarId === a.id ? "scale(1.08)" : "scale(1)",
                      }}
                      dangerouslySetInnerHTML={{ __html: a.svg }}
                    />
                  ))}
                </div>
                {savingAvatar && (
                  <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.5rem", textAlign: "center" }}>
                    Saving...
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="fn-hero-name">
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Profile"}
              </p>
              <p className="fn-hero-email">{user.email}</p>
            </div>
            {userProfile && (
              <div className="fn-stats">
                <StatPill label="Trees grown"  value={userProfile.treeCount    ?? 0} icon="&#127795;" />
                <StatPill label="Sessions"     value={userProfile.totalSessions ?? 0} icon="&#9201;" />
              </div>
            )}
          </div>

          {/* ── Personal info ── */}
          <SectionCard title="Personal info">
            <form onSubmit={handleSaveProfile}>
              <div className="fn-grid2">
                <Field label="First name">
                  <input className="fn-input" placeholder="Ada"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Last name">
                  <input className="fn-input" placeholder="Lovelace"
                    value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
              </div>
              <Field label="Major / Subject">
                <input className="fn-input" placeholder="e.g. Computer Science"
                  value={major} onChange={(e) => setMajor(e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className="fn-input" placeholder="+44 7700 000000"
                  value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Email address">
                <div className="fn-email-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  {user.email}
                </div>
              </Field>
              <div className="fn-divider" />
              <StatusMsg msg={saveMsg} />
              <button type="submit" className="fn-btn fn-btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          </SectionCard>

          {/* ── Change password ── */}
          <SectionCard title="Change password">
            <form onSubmit={handleChangePassword}>
              <Field label="Current password">
                <div className="fn-pw-wrap">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    className="fn-input"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="fn-pw-toggle" onClick={() => setShowCurrentPw((v) => !v)}>
                    {showCurrentPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </Field>

              <Field label="New password">
                <div className="fn-pw-wrap">
                  <input
                    type={showNewPw ? "text" : "password"}
                    className="fn-input"
                    placeholder="8+ characters, mixed case &amp; numbers"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="fn-pw-toggle" onClick={() => setShowNewPw((v) => !v)}>
                    {showNewPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {/* Live strength meter */}
                <PasswordStrength password={newPassword} />
              </Field>

              <Field label="Confirm new password">
                <div className="fn-pw-wrap">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    className="fn-input"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={confirmPassword && confirmPassword !== newPassword
                      ? { borderColor: "#ef4444" } : {}}
                  />
                  <button type="button" className="fn-pw-toggle" onClick={() => setShowConfirmPw((v) => !v)}>
                    {showConfirmPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: "0.25rem" }}>
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && confirmPassword === newPassword && newPassword && (
                  <p style={{ fontSize: "0.72rem", color: "#10b981", marginTop: "0.25rem" }}>
                    &#10003; Passwords match
                  </p>
                )}
              </Field>

              <div className="fn-divider" />
              <StatusMsg msg={passwordMsg} />

              <button
                type="submit"
                className="fn-btn fn-btn-primary"
                disabled={changingPassword || (!!confirmPassword && confirmPassword !== newPassword)}
              >
                {changingPassword ? "Updating..." : "Update password"}
              </button>
            </form>
          </SectionCard>

          {/* ── Account ── */}
          <SectionCard title="Account">
            <p style={{ fontSize: "0.85rem", color: "var(--fn-ink-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
              Signing out will end your current session on this device.
            </p>
            <button className="fn-btn fn-btn-danger" onClick={() => setShowLogoutConfirm(true)}>
              Sign out
            </button>
          </SectionCard>

        </div>
      </div>

      {/* ── Logout modal ── */}
      {showLogoutConfirm && (
        <div className="fn-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="fn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6e50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <p className="fn-modal-title">Sign out of FocusNest?</p>
            <p className="fn-modal-body">
              Your progress and data are safely saved. You can sign back in any time.
            </p>
            <div className="fn-modal-actions">
              <button className="fn-btn fn-btn-outline" onClick={() => setShowLogoutConfirm(false)}>
                Stay
              </button>
              <button className="fn-btn fn-btn-danger" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
