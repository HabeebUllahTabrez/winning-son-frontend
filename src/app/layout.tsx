// src/app/layout.tsx
"use client";

import { Patrick_Hand } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast"; // 1. Import the Toaster
import "./globals.css";

const scribble = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-scribble",
});

// ... (Nav component remains the same)
function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  };

  const navLinks = (
    <>
      <Link href="/dashboard" className="hover:underline">Dashboard</Link>
      <Link href="/journal" className="hover:underline">Journal</Link>
      <Link href="/submissions" className="hover:underline">Submissions</Link>
      <Link href="/analyzer" className="hover:underline">Analyzer</Link>
      <Link href="/reports" className="hover:underline">Reports</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-sm border-b-2 border-black">
      <div className="max-w-5xl mx-auto px-4">
        <div className="py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl">WinningSon-inator</Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-lg">
            {isLoggedIn ? (
              <>
                {navLinks}
                <button onClick={handleLogout} className="hover:underline">Logout</button>
              </>
            ) : (
              <Link href="/" className="hover:underline">Login</Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col items-start gap-4 pb-4 text-lg">
            {isLoggedIn ? (
              <>
                {navLinks}
                <button onClick={handleLogout} className="hover:underline">Logout</button>
              </>
            ) : (
              <Link href="/" className="hover:underline">Login</Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${scribble.variable} min-h-screen text-black`}
        style={{ fontFamily: "var(--font-scribble), sans-serif" }}
      >
        <div className="flex flex-col min-h-screen">
          <Nav />
          <main className="flex-grow w-full">{children}</main>
          {/* 2. Add the Toaster component with custom styling */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#000',
                border: '2px solid #000',
                boxShadow: '4px 4px 0 0 #000',
                borderRadius: '6px 4px 5px 4px',
                fontFamily: 'var(--font-scribble), sans-serif',
                fontSize: '1.1rem',
                padding: '1rem',
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
