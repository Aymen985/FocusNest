// app/(auth)/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Brand mark */}
      <Link
        href="/"
        className="mb-8 text-xl font-bold text-neutral-50 tracking-tight hover:opacity-80 transition-opacity"
      >
        FocusNest
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  );
}
