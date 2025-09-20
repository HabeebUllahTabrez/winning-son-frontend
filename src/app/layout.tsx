// src/app/layout.tsx
"use client";

import { Patrick_Hand } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import clsx from "clsx"; // 1. Import clsx for cleaner conditional classes
import "./globals.css";
import { exitGuestMode, logout } from "@/lib/api";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";
import { Analytics } from '@vercel/analytics/next';
import { isGuestUser } from "@/lib/guest";

const scribble = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-scribble",
});

// --- New, Redesigned Nav Component ---
function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authStatus, setAuthStatus] = useState<"loading" | "loggedIn" | "guest" | "loggedOut">("loading");
  const router = useRouter();
  const pathname = usePathname();

  // Effect to check login status and close menu on page change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const guest = isGuestUser();
    console.log("Token:", token, "Guest:", guest);

    if (guest) {
      setAuthStatus("guest");
    } else {
      setAuthStatus(token ? "loggedIn" : "loggedOut");
    }
    
    setIsMenuOpen(false); // Close mobile menu on navigation
  }, [pathname]);

  const handleLogout = () => {
    logout();
  };

  // 2. Define nav links as an array for easier mapping
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    // { href: "/journal", label: "Journal" },
    { href: "/submissions", label: "Submissions" },
    { href: "/analyzer", label: "Analyzer" },
    { href: "/profile", label: "Profile" },
  ];

  // Help link is always visible
  const helpLink = { href: "/help", label: "Help" };

  // Reusable component for links to handle active state styling
  // Reusable component for links to handle active state styling
  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={clsx(
        // Makes the entire row a clickable, full-width block on mobile.
        // Resets to auto-width on desktop (md screens and up).
        "w-full md:w-auto", 
        // Consistent padding and hover effect for both mobile and desktop.
        "px-2 py-1 transition-colors duration-200 hover:text-gray-600"
      )}
    >
      <span
        className={clsx(
          // Active state style is now on the span, so the border only
          // underlines the text itself, not the full row.
          pathname === href && "font-bold border-b-2 border-black"
        )}
      >
        {label}
      </span>
    </Link>
  );

  const handleExitGuestMode = () => {
    exitGuestMode();
    setAuthStatus("loggedOut");
  };

  const renderNavContent = () => {
    // If we're still checking, render nothing to match the server.
    if (authStatus === "loading") {
      return null;
    }
    console.log("Auth Status:", authStatus);

    // If we've confirmed the user is logged in or is a guest...
    if (authStatus === "loggedIn" || authStatus === "guest") {
      return (
        <>
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {
            authStatus === "loggedIn" && (
              <button
                onClick={handleLogout}
                className="px-2 py-1 hover:text-gray-600 transition-colors duration-200"
              >
                Logout
              </button>
            )
          }
        </>
      );
    }

    // Otherwise, the user is logged out.
    return <NavLink href="/" label="Login" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl">
            WinningSon-inator
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 text-lg">
            <NavLink {...helpLink} />
            {renderNavContent()}
          </nav>

          {/* 3. Redesigned Mobile Menu Button with Animation */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 z-50"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <div className="w-7 h-7 flex flex-col justify-around">
              <span className={clsx("h-0.5 w-full bg-black rounded-full transition-transform duration-300", isMenuOpen && "rotate-45 translate-y-[5px]")}></span>
              <span className={clsx("h-0.5 w-full bg-black rounded-full transition-opacity duration-300", isMenuOpen && "opacity-0")}></span>
              <span className={clsx("h-0.5 w-full bg-black rounded-full transition-transform duration-300", isMenuOpen && "-rotate-45 -translate-y-[5px]")}></span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Redesigned Mobile Menu Dropdown with Animation */}
      <div
        className={clsx(
          "md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b-2 border-black overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="flex flex-col items-start gap-2 p-4 text-lg">
          <NavLink {...helpLink} />
          {renderNavContent()}
        </nav>
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
      <head>
        {/* Favicon Configuration */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional favicon sizes */}
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WinningSoninator" />
        
        <GoogleAnalytics />
        <Clarity />
      </head>
      <body
        className={`${scribble.variable} min-h-screen bg-gray-50 text-black`}
        style={{ fontFamily: "var(--font-scribble), sans-serif" }}
      >
        <div className="flex flex-col min-h-screen">
          <Nav />
          <main className="flex-grow w-full">{children}</main>
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
        <Analytics />
      </body>
    </html>
  );
}
