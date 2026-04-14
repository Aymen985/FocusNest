"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import PomodoroWidget from "../components/PomodoroWidget";
import AssistantWidget from "../components/AssistantWidget";
import ForestWidget from "../components/ForestWidget";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main style={{ padding: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(360px, 1.2fr) minmax(320px, 1fr)",
          gap: "2rem",
          alignItems: "start",
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <PomodoroWidget />
        <section
          style={{
            padding: "1.25rem",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            textAlign: "center",
          }}
        >
          <div style={{ opacity: 0.8, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            AI STUDY ASSISTANT
          </div>
          <h1 style={{ margin: "0.4rem 0 0", fontSize: "2rem", lineHeight: 1.1 }}>
            FocusNest
          </h1>
          <p style={{ opacity: 0.8, margin: "0.6rem 0 0", fontSize: "0.95rem" }}>
            Study with an AI assistant, with focus tools on the sides.
          </p>
        </section>
        <ForestWidget />
      </div>
      <div style={{ marginTop: "1.5rem", maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
        <AssistantWidget />
      </div>
    </main>
  );
}