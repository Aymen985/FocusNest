"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProfilePage() {
  const { user, userProfile, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingScreen />;

  if (!user) {
    router.push("/login");
    return null;
  }

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