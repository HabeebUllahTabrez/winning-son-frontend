"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { isGuestUser } from "@/lib/guest"; // 1. Import the guest check function

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_id: number;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  is_admin: boolean;
};

type ProfileSetupGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

// Define a key for the guest's profile data in localStorage
const GUEST_PROFILE_KEY = "guestProfileData";

export function ProfileSetupGuard({ children, redirectTo = "/setup" }: ProfileSetupGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    // 2. Check if the user is a guest at the very beginning
    const isGuest = isGuestUser();

    // --- GUEST LOGIC ---
    if (isGuest) {
      try {
        const guestProfileRaw = localStorage.getItem(GUEST_PROFILE_KEY);

        if (!guestProfileRaw) {
          // If no guest profile exists, they need to set one up.
          setNeedsSetup(true);
          routerRef.current.push(redirectTo);
        } else {
          // If a profile exists, check if it's complete.
          const profile: Partial<UserProfile> = JSON.parse(guestProfileRaw);
          const isIncomplete = !profile.first_name || 
                             !profile.last_name || 
                             !profile.goal || 
                             !profile.start_date || 
                             !profile.end_date;
          
          if (isIncomplete) {
            setNeedsSetup(true);
            routerRef.current.push(redirectTo);
          }
        }
      } catch (error) {
        console.error("Error checking guest profile:", error);
        // If there's an error (e.g., malformed JSON), clear it and send to setup
        localStorage.removeItem(GUEST_PROFILE_KEY);
        setNeedsSetup(true);
        routerRef.current.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
      return; // End the effect for guest users here
    }

    // --- AUTHENTICATED USER LOGIC (using httpOnly cookies) ---
    const checkProfile = async () => {
      try {
        // First check if user is authenticated via cookie
        const authCheck = await apiFetch("/api/auth/check");

        if (authCheck.status !== 200 || !authCheck.data?.authenticated) {
          // Don't redirect if user just became a guest, redirect to home
          routerRef.current.push("/");
          return;
        }

        // Then get user profile
        const res = await apiFetch("/api/me");

        if (res.status !== 200) {
          if (res.status !== 401) {
            routerRef.current.push("/");
          }
          return;
        }

        const profile: UserProfile = res.data;

        const isIncomplete = !profile.first_name ||
                           !profile.last_name ||
                           !profile.goal ||
                           !profile.start_date ||
                           !profile.end_date;

        if (isIncomplete) {
          setNeedsSetup(true);
          routerRef.current.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        routerRef.current.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // If redirecting, return null to prevent brief flash of content
  if (needsSetup) {
    return null; 
  }

  return <>{children}</>;
}
