"use client";

import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, userProfile, logout, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>You are not logged in.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Profile</h1>

      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>

      {userProfile && (
        <>
          <p><strong>Trees:</strong> {userProfile.treeCount}</p>
          <p><strong>Sessions:</strong> {userProfile.totalSessions}</p>
        </>
      )}

      <button onClick={logout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}