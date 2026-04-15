import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { PomodoroProvider } from "@/context/PomodoroContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusNest — Study Smarter",
  description: "FocusNest is your all-in-one study productivity app. Plan your week, track sessions with Pomodoro, generate AI flashcards, and chat with your documents.",
  keywords: ["study", "productivity", "pomodoro", "flashcards", "AI assistant", "timetable"],
  authors: [{ name: "FocusNest" }],
  openGraph: {
    title: "FocusNest — Study Smarter",
    description: "Your all-in-one study productivity app with Pomodoro, AI assistant, flashcards, and weekly timetable.",
    images: ["/Focusnest_Logo.png"],
    type: "website",
  },
  icons: {
    icon: "/Focusnest_Logo.png",
    shortcut: "/Focusnest_Logo.png",
    apple: "/Focusnest_Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <PomodoroProvider>
            <Navbar />
            {children}
          </PomodoroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
