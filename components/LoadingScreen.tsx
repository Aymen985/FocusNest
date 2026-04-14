// components/LoadingScreen.tsx
export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontSize: 16,
      color: "var(--color-text-secondary)",
    }}>
      Loading...
    </div>
  );
}