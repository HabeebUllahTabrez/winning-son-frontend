// src/app/layout.tsx
"use client";

import { Patrick_Hand } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import clsx from "clsx"; // 1. Import clsx for cleaner conditional classes
import "./globals.css";
import { exitGuestMode } from "@/lib/api";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from '@vercel/analytics/next';
import { isGuestUser, getGuestEntries } from "@/lib/guest";
import MixpanelProvider from "@/components/MixpanelProvider";
import { resetMixpanel, trackEvent } from "@/lib/mixpanel";
import { Modal } from "@/components/Modal";
import { CreateAccountForm } from "@/components/CreateAccountForm";
import { migrateFromOldAuth } from "@/lib/auth-migration";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const scribble = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-scribble",
});

// --- New, Redesigned Nav Component ---
function Nav({ setIsCreateAccountModalOpen }: { setIsCreateAccountModalOpen: (open: boolean) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<"loading" | "loggedIn" | "guest" | "loggedOut">("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();
  
  // Exit guest mode confirmation state
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [guestEntryCount, setGuestEntryCount] = useState(0);

  // Track scroll position for dynamic shadow
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to check login status and close menu on page change
  useEffect(() => {
    // Run migration to remove old localStorage tokens
    migrateFromOldAuth();

    const checkAuthStatus = async () => {
      const guest = isGuestUser();

      if (guest) {
        setAuthStatus("guest");
        setIsAdmin(false);
        // Get the count of guest entries for the confirmation dialog
        const entries = getGuestEntries();
        setGuestEntryCount(entries.length);
      } else {
        try {
          // Check auth via httpOnly cookie
          const res = await fetch("/api/auth/check");
          if (res.ok) {
            const data = await res.json();
            setAuthStatus(data.authenticated ? "loggedIn" : "loggedOut");

            // Check if user is admin
            if (data.authenticated) {
              try {
                const userRes = await fetch("/api/proxy/me");
                if (userRes.ok) {
                  const userData = await userRes.json();
                  setIsAdmin(userData.is_admin || false);
                }
              } catch {
                setIsAdmin(false);
              }
            }
          } else {
            setAuthStatus("loggedOut");
            setIsAdmin(false);
          }
        } catch {
          setAuthStatus("loggedOut");
          setIsAdmin(false);
        }
      }
    };

    checkAuthStatus();
    setIsMenuOpen(false); // Close mobile menu on navigation
  }, [pathname]);

  // 2. Define nav links as an array for easier mapping (with SVG icons for mobile)
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { href: "/submissions", label: "Submissions", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { href: "/analyzer", label: "Analyzer", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { href: "/profile", label: "Profile", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  // Help link is always visible
  const helpLink = { href: "/help", label: "Help", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )};

  // Reusable component for desktop links with enhanced styling
  const NavLink = ({ href, label }: { href: string; label: string; icon?: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={clsx(
          "relative px-3 py-1.5 rounded-full transition-all duration-200 ease-out",
          "hover:bg-black/5",
          isActive && "bg-black text-white font-bold",
          !isActive && "hover:scale-105"
        )}
      >
        {label}
      </Link>
    );
  };

  // Reusable component for mobile links with icons and animations
  const MobileNavLink = ({ href, label, icon, index }: { href: string; label: string; icon?: React.ReactNode; index: number }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={clsx(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
          "hover:bg-black/5 hover:translate-x-1",
          isActive && "bg-black/10 font-bold"
        )}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {icon && <span className="text-gray-600">{icon}</span>}
        <span>{label}</span>
      </Link>
    );
  };

  const handleExitGuestModeClick = () => {
    // Close mobile menu first
    setIsMenuOpen(false);
    
    // Check if there are any journal entries before showing confirmation
    const entries = getGuestEntries();
    if (entries.length > 0) {
      setGuestEntryCount(entries.length);
      setIsExitConfirmOpen(true);
    } else {
      // No entries, exit immediately
      confirmExitGuestMode();
    }
  };

  const confirmExitGuestMode = () => {
    trackEvent("Guest Mode Exited", { entriesLost: guestEntryCount });
    resetMixpanel();
    exitGuestMode();
    setAuthStatus("loggedOut");
    setIsExitConfirmOpen(false);
  };

  const renderNavContent = () => {
    // If we're still checking, render nothing to match the server.
    if (authStatus === "loading") {
      return null;
    }

    // If we've confirmed the user is logged in or is a guest...
    if (authStatus === "loggedIn" || authStatus === "guest") {
      return (
        <>
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {authStatus === "guest" && (
            <button
              onClick={handleExitGuestModeClick}
              className={clsx(
                "px-3 py-1.5 rounded-full transition-all duration-200",
                "text-orange-600 hover:bg-orange-100 hover:scale-105",
                "border border-orange-300 hover:border-orange-400",
                "text-sm font-medium"
              )}
            >
              Exit Guest
            </button>
          )}
        </>
      );
    }

    // Otherwise, the user is logged out.
    return (
      <Link
        href="/login"
        className={clsx(
          "px-4 py-1.5 rounded-full transition-all duration-200",
          "bg-black text-white font-bold",
          "hover:scale-105 hover:shadow-md"
        )}
      >
        Login
      </Link>
    );
  };

  return (
    <>
      {/* Exit Guest Mode Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isExitConfirmOpen}
        onCancel={() => setIsExitConfirmOpen(false)}
        onConfirm={confirmExitGuestMode}
        title="🚨 Wait! Your Data's About to Vanish!"
        confirmText="Embrace the Void"
        cancelText="Keep My Entries"
        variant="warning"
        confirmingText="Vanishing..."
      >
        <div className="space-y-4">
          <p className="text-lg">
            You have <span className="font-bold text-orange-600">{guestEntryCount} {guestEntryCount === 1 ? 'legendary entry' : 'legendary entries'}</span> that 
            will be <span className="font-bold">lost forever</span> if you exit guest mode!
          </p>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <p className="text-base text-orange-800">
              📜 Your chronicles, your wisdom, your moments of glory... 
              <span className="font-bold">poof!</span> Gone like a sneeze in a hurricane.
            </p>
          </div>
          <p className="text-base text-gray-600">
            Consider <button 
              onClick={() => {
                setIsExitConfirmOpen(false);
                setIsCreateAccountModalOpen(true);
              }}
              className="font-bold underline text-blue-600 hover:text-blue-800"
            >
              creating a free account
            </button> to save your data instead!
          </p>
        </div>
      </ConfirmDialog>

      <header 
        className={clsx(
          "sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b-2 border-black",
          "transition-shadow duration-300",
          hasScrolled && "shadow-lg"
        )}
      >
        {/* Guest mode banner with enhanced styling */}
        {authStatus === "guest" && (
          <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-b-2 border-yellow-400 text-yellow-800 text-center text-sm py-2.5 px-4">
            <span className="inline-flex items-center gap-2 flex-wrap justify-center">
              <span className="animate-bounce-slow">👋</span>
              <span>You&apos;re in <span className="font-bold">Guest Mode</span> — data is saved locally only.</span>
              <button
                onClick={() => setIsCreateAccountModalOpen(true)}
                className={clsx(
                  "inline-flex items-center gap-1 px-3 py-0.5 rounded-full",
                  "bg-yellow-200 hover:bg-yellow-300 border border-yellow-400",
                  "font-bold transition-all duration-200 hover:scale-105"
                )}
              >
                <span>🚀</span> Create Account
              </button>
            </span>
          </div>
        )}
        {/* end banner for guest user */}
        {/* Main Nav Bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            {/* Logo */}
            <Link 
              href={authStatus === "guest" ? "/dashboard" : "/"} 
              className="font-bold text-2xl hover:scale-[1.02] transition-transform duration-200"
            >
              WinningSon-inator
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2 text-base">
              {renderNavContent()}
            </nav>

            {/* Mobile Menu Button with smooth animation */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={clsx(
                "md:hidden p-2.5 rounded-lg z-50 transition-all duration-200",
                "hover:bg-black/5",
                isMenuOpen && "bg-black/5"
              )}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={clsx(
                  "h-0.5 w-full bg-black rounded-full transition-all duration-300 origin-left",
                  isMenuOpen && "rotate-45 translate-x-px"
                )} />
                <span className={clsx(
                  "h-0.5 w-full bg-black rounded-full transition-all duration-200",
                  isMenuOpen && "opacity-0 scale-x-0"
                )} />
                <span className={clsx(
                  "h-0.5 w-full bg-black rounded-full transition-all duration-300 origin-left",
                  isMenuOpen && "-rotate-45 translate-x-px"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu with slide animation */}
        <div
          className={clsx(
            "md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-lg border-b-2 border-black",
            "overflow-hidden transition-all duration-300 ease-out",
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col p-3 text-lg">
            {(authStatus === "loggedIn" || authStatus === "guest") && (
              <>
                {navLinks.map((link, index) => (
                  <MobileNavLink key={link.href} {...link} index={index} />
                ))}
                <MobileNavLink {...helpLink} index={navLinks.length} />
                {authStatus === "guest" && (
                  <button
                    onClick={handleExitGuestModeClick}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-lg transition-all duration-200",
                      "text-orange-600 bg-orange-50 hover:bg-orange-100",
                      "border border-orange-200"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Exit Guest Mode</span>
                  </button>
                )}
              </>
            )}
            {authStatus === "loggedOut" && (
              <Link
                href="/login"
                className={clsx(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                  "bg-black text-white font-bold",
                  "transition-all duration-200 hover:scale-[1.02]"
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
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
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="TjrWw1a1EEdYF5DHnyMt2vFFqHS3tsd5MKMBumRV1ZA" />
        
        <GoogleAnalytics />
      </head>
      <body
        className={`${scribble.variable} min-h-screen bg-gray-50 text-black`}
        style={{ fontFamily: "var(--font-scribble), sans-serif" }}
      >
        <div className="flex flex-col min-h-screen">
          <MixpanelProvider />
          <Nav setIsCreateAccountModalOpen={setIsCreateAccountModalOpen} />
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
        <Modal isOpen={isCreateAccountModalOpen} onClose={() => setIsCreateAccountModalOpen(false)} title="Create a Free Account" backdropClassName="backdrop-blur-sm">
          <CreateAccountForm closeModal={() => setIsCreateAccountModalOpen(false)} />
        </Modal>
      </body>
    </html>
  );
}
