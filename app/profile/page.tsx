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

/* --- tiny helpers --------------------------------------- */
function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
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

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fn-card">
      <h2 className="fn-card-title">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
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
      {ok ? "?" : "?"} {msg}
    </p>
  );
}

/* --- main page ------------------------------------------ */
export default function ProfilePage() {
  const { user, userProfile, logout, loading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [major, setMajor] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId | "">("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setMajor(userProfile.major || "");
      setPhone(userProfile.phone || "");
      setAvatarId((userProfile.avatar as AvatarId) || "");
    }
  }, [userProfile]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMsg("");
    try {
      const credential = EmailAuthProvider.credential(
        user!.email!,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);
      setPasswordMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      if (err.code === "auth/wrong-password")
        setPasswordMsg("Current password is incorrect.");
      else if (err.code === "auth/weak-password")
        setPasswordMsg("New password is too weak (min 6 chars).");
      else setPasswordMsg("Failed to change password.");
    }
    setChangingPassword(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      {/* -- scoped styles -- */}
      <style>{`
        /* Palette � light mode default */
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
        /* Dark mode � responds to .dark on <html> */
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

        /* Page shell */
        .fn-page {
          min-height: 100vh;
          background: var(--fn-parchment);
          font-family: Arial, Helvetica, sans-serif;
          color: var(--fn-ink);
          padding: 2.5rem 1rem 4rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .fn-page.fn-mounted {
          opacity: 1;
          transform: translateY(0);
        }
        .fn-inner {
          max-width: 640px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Hero / avatar banner */
        .fn-hero {
          background: var(--fn-paper);
          border: 1px solid var(--fn-border);
          border-radius: 20px;
          box-shadow: var(--fn-shadow);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }
        .fn-avatar-ring {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: conic-gradient(
            var(--fn-terra) 0deg 120deg,
            var(--fn-sage) 120deg 240deg,
            #c4a86b 240deg 360deg
          );
          padding: 3px;
          flex-shrink: 0;
        }
        .fn-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--fn-paper);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--fn-terra);
          letter-spacing: -1px;
        }
        .fn-hero-name {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--fn-ink);
          line-height: 1.2;
        }
        .fn-hero-email {
          font-size: 0.82rem;
          color: var(--fn-ink-subtle);
          font-family: 'Courier New', monospace;
          margin-top: -0.25rem;
        }
        .fn-stats {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .fn-stat-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--fn-parchment);
          border: 1px solid var(--fn-border);
          border-radius: 999px;
          padding: 0.4rem 0.9rem;
        }
        .fn-stat-icon { font-size: 1rem; }
        .fn-stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--fn-ink);
          line-height: 1.1;
          margin: 0;
        }
        .fn-stat-label {
          font-size: 0.68rem;
          color: var(--fn-ink-subtle);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          font-family: Arial, sans-serif;
        }

        /* Section cards */
        .fn-card {
          background: var(--fn-paper);
          border: 1px solid var(--fn-border);
          border-radius: 16px;
          box-shadow: var(--fn-shadow);
          padding: 1.75rem;
        }
        .fn-card-title {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--fn-ink-subtle);
          margin: 0 0 1.25rem;
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .fn-card-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--fn-border);
        }

        /* Form fields */
        .fn-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 480px) {
          .fn-grid2 { grid-template-columns: 1fr; }
        }
        .fn-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 0.75rem;
        }
        .fn-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--fn-ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: Arial, sans-serif;
        }
        .fn-input {
          background: var(--fn-parchment);
          border: 1.5px solid var(--fn-border);
          border-radius: 10px;
          padding: 0.6rem 0.85rem;
          font-size: 0.92rem;
          color: var(--fn-ink);
          font-family: Arial, Helvetica, sans-serif;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .fn-input::placeholder { color: var(--fn-ink-subtle); }
        .fn-input:focus {
          border-color: var(--fn-terra);
          box-shadow: 0 0 0 3px var(--fn-terra-light);
        }
        .fn-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .fn-email-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--fn-parchment);
          border: 1.5px solid var(--fn-border);
          border-radius: 10px;
          padding: 0.6rem 0.85rem;
          font-size: 0.88rem;
          color: var(--fn-ink-muted);
          font-family: 'Courier New', monospace;
        }
        .fn-email-lock {
          font-size: 0.8rem;
          opacity: 0.5;
        }

        /* Buttons */
        .fn-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 1.4rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          border: none;
          font-family: Arial, sans-serif;
          letter-spacing: 0.01em;
        }
        .fn-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .fn-btn-primary {
          background: var(--fn-terra);
          color: #fff;
        }
        .fn-btn-primary:not(:disabled):hover {
          background: #b05a2e;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196,107,60,0.35);
        }
        .fn-btn-outline {
          background: transparent;
          border: 1.5px solid var(--fn-border);
          color: var(--fn-ink-muted);
        }
        .fn-btn-outline:not(:disabled):hover {
          border-color: var(--fn-ink-muted);
          color: var(--fn-ink);
        }
        .fn-btn-danger {
          background: transparent;
          border: 1.5px solid rgba(255,100,80,0.35);
          color: #ff6e50;
        }
        .fn-btn-danger:hover {
          background: rgba(255,100,80,0.1);
          border-color: #ff6e50;
        }

        /* Status messages */
        .fn-status {
          font-size: 0.82rem;
          font-family: Arial, sans-serif;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          font-weight: 500;
        }
        .fn-status--ok  { background: var(--fn-sage-light); color: var(--fn-sage); }
        .fn-status--err { background: var(--fn-terra-light); color: var(--fn-terra); }

        /* Divider */
        .fn-divider {
          height: 1px;
          background: var(--fn-border);
          margin: 1.25rem 0;
        }

        /* Logout modal */
        .fn-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }
        .fn-modal {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2rem;
          max-width: 340px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: fn-pop 0.2s ease;
        }
        @keyframes fn-pop {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .fn-modal-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .fn-modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--fn-ink);
          margin-bottom: 0.4rem;
        }
        .fn-modal-body {
          font-size: 0.85rem;
          color: var(--fn-ink-muted);
          margin-bottom: 1.5rem;
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }
        .fn-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
      `}</style>

      <div className={`fn-page${mounted ? " fn-mounted" : ""}`}>
        <div className="fn-inner">

          {/* -- Hero -- */}
          <div className="fn-hero" style={{ position: "relative" }}>
            <div className="fn-avatar-ring" style={{ cursor: "pointer", position: "relative" }}
              onClick={() => setShowAvatarPicker(v => !v)}>
              {avatarId ? (
                <div className="fn-avatar-inner" style={{ padding: 0, overflow: "hidden" }}
                  dangerouslySetInnerHTML={{ __html: getAvatar(avatarId).svg }} />
              ) : (
                <div className="fn-avatar-inner">
                  {initials(firstName, lastName)}
                </div>
              )}
              <span style={{
                position: "absolute", bottom: 2, right: 2,
                background: "#10b981", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 10, color: "#fff", border: "2px solid var(--fn-paper)"
              }}>??</span>
            </div>

            {/* Avatar picker */}
            {showAvatarPicker && (
              <div style={{
                position: "absolute", top: "100%", left: "50%",
                transform: "translateX(-50%)",
                background: "var(--fn-paper)", border: "1px solid var(--fn-border)",
                borderRadius: 16, padding: "1rem", zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: 280,
              }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--fn-ink-subtle)", marginBottom: "0.75rem" }}>
                  Male
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  {AVATARS.filter(a => a.id.startsWith("m")).map(a => (
                    <div key={a.id}
                      onClick={() => handleSaveAvatar(a.id as AvatarId)}
                      style={{
                        width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
                        border: avatarId === a.id ? "2.5px solid #10b981" : "2.5px solid transparent",
                        overflow: "hidden", transition: "border-color 0.15s",
                      }}
                      dangerouslySetInnerHTML={{ __html: a.svg }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--fn-ink-subtle)", marginBottom: "0.75rem" }}>
                  Female
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AVATARS.filter(a => a.id.startsWith("f")).map(a => (
                    <div key={a.id}
                      onClick={() => handleSaveAvatar(a.id as AvatarId)}
                      style={{
                        width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
                        border: avatarId === a.id ? "2.5px solid #10b981" : "2.5px solid transparent",
                        overflow: "hidden", transition: "border-color 0.15s",
                      }}
                      dangerouslySetInnerHTML={{ __html: a.svg }}
                    />
                  ))}
                </div>
                {savingAvatar && (
                  <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.5rem", textAlign: "center" }}>
                    Saving�
                  </p>
                )}
              </div>
            )}
            <div>
              <p className="fn-hero-name">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : "Your Profile"}
              </p>
              <p className="fn-hero-email">{user.email}</p>
            </div>
            {userProfile && (
              <div className="fn-stats">
                <StatPill label="Trees grown" value={userProfile.treeCount} icon="??" />
                <StatPill label="Sessions" value={userProfile.totalSessions} icon="?" />
              </div>
            )}
          </div>

          {/* -- Personal info -- */}
          <SectionCard title="Personal info">
            <form onSubmit={handleSaveProfile}>
              <div className="fn-grid2">
                <Field label="First name">
                  <input
                    className="fn-input"
                    placeholder="Ada"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    className="fn-input"
                    placeholder="Lovelace"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Major / Subject">
                <input
                  className="fn-input"
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </Field>

              <Field label="Phone">
                <input
                  className="fn-input"
                  placeholder="+44 7700 000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <Field label="Email address">
                <div className="fn-email-row">
                  <span className="fn-email-lock">??</span>
                  {user.email}
                </div>
              </Field>

              <div className="fn-divider" />
              <StatusMsg msg={saveMsg} />

              <button type="submit" className="fn-btn fn-btn-primary" disabled={saving}>
                {saving ? "Saving�" : "Save changes"}
              </button>
            </form>
          </SectionCard>

          {/* -- Change password -- */}
          <SectionCard title="Change password">
            <form onSubmit={handleChangePassword}>
              <Field label="Current password">
                <input
                  type="password"
                  className="fn-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>

              <Field label="New password">
                <input
                  type="password"
                  className="fn-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Field>

              <div className="fn-divider" />
              <StatusMsg msg={passwordMsg} />

              <button
                type="submit"
                className="fn-btn fn-btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? "Updating�" : "Update password"}
              </button>
            </form>
          </SectionCard>

          {/* -- Account actions -- */}
          <SectionCard title="Account">
            <p style={{ fontSize: "0.85rem", color: "var(--fn-ink-muted)", marginBottom: "1rem", fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
              Signing out will end your current session on this device.
            </p>
            <button
              className="fn-btn fn-btn-danger"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sign out
            </button>
          </SectionCard>

        </div>
      </div>

      {/* -- Logout modal -- */}
      {showLogoutConfirm && (
        <div className="fn-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="fn-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fn-modal-icon">??</div>
            <p className="fn-modal-title">Sign out of FocusNest?</p>
            <p className="fn-modal-body">
              Your progress and data are safely saved. You can sign back in any time.
            </p>
            <div className="fn-modal-actions">
              <button
                className="fn-btn fn-btn-outline"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay
              </button>
              <button
                className="fn-btn fn-btn-danger"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
