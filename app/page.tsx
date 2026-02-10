import PomodoroWidget from "../components/PomodoroWidget";
import AssistantWidget from "../components/AssistantWidget";
import ForestWidget from "../components/ForestWidget";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ marginTop: 0 }}>FocusNest</h1>
      <p style={{ opacity: 0.8, marginTop: "0.25rem" }}>
        Study with an AI assistant in the center, and focus tools on the sides.
      </p>

      <div
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <PomodoroWidget />
        <AssistantWidget />
        <ForestWidget />
      </div>
    </main>
  );
}
