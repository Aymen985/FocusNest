import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { PomodoroProvider } from "@/context/PomodoroContext";
import { GuestProvider } from "@/context/GuestContext";
import { LanguageProvider } from "@/context/LanguageContext";
import WelcomeModal from "@/components/WelcomeModal";

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
  description: "FocusNest is your all-in-one study productivity app.",
  keywords: ["study", "productivity", "pomodoro", "flashcards", "AI assistant", "timetable"],
  authors: [{ name: "FocusNest" }],
  openGraph: {
    title: "FocusNest — Study Smarter",
    description: "Your all-in-one study productivity app.",
    images: ["/icon.png"],
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('focusnest_theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.removeAttribute('data-theme')}else if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light')}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}var l=localStorage.getItem('focusnest_lang');if(l){document.documentElement.setAttribute('lang',l);document.documentElement.setAttribute('dir',l==='ar'?'rtl':'ltr')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <GuestProvider>
            <LanguageProvider>
              <PomodoroProvider>
                <AppShell>
                  <WelcomeModal />
                  {children}
                </AppShell>
              </PomodoroProvider>
            </LanguageProvider>
          </GuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
