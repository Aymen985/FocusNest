import Link from "next/link";

const linkStyle: React.CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: "0.5rem",
  textDecoration: "none",
};

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        padding: "1rem 2rem",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <Link href="/" style={{ ...linkStyle, fontWeight: 700 }}>
        FocusNest
      </Link>
      <Link href="/pomodoro" style={linkStyle}>
        Pomodoro
      </Link>
      <Link href="/progress" style={linkStyle}>
        Progress
      </Link>
      <Link href="/assistant" style={linkStyle}>
        Assistant
      </Link>
    </nav>
  );
}
