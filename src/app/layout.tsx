import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FoodLabel AI — Know What You Eat",
  description:
    "Get an instant health verdict on any food label. Personalized for diabetes, hypertension, and allergies — powered by Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">
        {/* Nav */}
        <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" id="nav-logo" className="flex items-center gap-2 group">
              <span className="text-2xl">🫙</span>
              <span className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                FoodLabel <span className="text-violet-400 font-normal text-sm">AI</span>
              </span>
            </Link>
            <Link
              href="/profile"
              id="nav-profile"
              className="text-sm font-medium text-slate-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
            >
              <span>⚙️</span> Health Profile
            </Link>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-600">
          Not a substitute for medical advice · Powered by Gemini AI
        </footer>
      </body>
    </html>
  );
}
