import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "FocusNest",
  description: "AI-powered study assistant with Pomodoro and progress tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
