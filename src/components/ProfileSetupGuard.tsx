"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

export function ProfileSetupGuard({ children, redirectTo = "/setup" }: ProfileSetupGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const res = await apiFetch("/api/me");

        if (!res.ok) {
          // If it's not a 401 (which would be handled by apiFetch), redirect to login
          if (res.status !== 401) {
            router.push("/");
          }
          return;
        }

        const profile: UserProfile = await res.json();
        
        // Check if profile is incomplete
        const isIncomplete = !profile.first_name || 
                           !profile.last_name || 
                           !profile.goal || 
                           !profile.start_date || 
                           !profile.end_date;

        if (isIncomplete) {
          setNeedsSetup(true);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [router, redirectTo]);

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

  if (needsSetup) {
    return null; // Will redirect to setup
  }

  return <>{children}</>;
}
