// app/login/page.tsx
"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { getGuestId, clearGuestData } from "@/lib/guest";

const WinningSonImage = () => (
  <div className="relative w-20 h-20 mx-auto rounded-full border-4 border-black overflow-hidden">
    <Image
      src="/dad-head.png"
      alt="A cartoon father peeking through a door, asking 'Are ya winning?'"
      layout="fill"
      objectFit="contain"
    />
  </div>
);

const copyStrings = {
  login: {
    title: "How's it *really* going?",
    subtitle: "Time to face the music... and your to-do list. Let's see the logs.",
    emailPlaceholder: "email",
    passwordPlaceholder: "password",
    submitButton: "Login",
    toggleModeText: "Sign up",
  },
  signup: {
    title: "Ready to Plot?",
    subtitle: "Document your world domination... or just remember to buy milk.",
    emailPlaceholder: "email",
    passwordPlaceholder: "password",
    confirmPasswordPlaceholder: "confirm password",
    submitButton: "Begin the Journal",
    toggleModeText: "or I already have an account",
  },
  errors: {
    emailRequired: "We need to know who's writing this story.",
    emailInvalid: "That email address looks like a typo from the future. Try again?",
    passwordRequired: "A journal without a lock is just a public diary.",
    passwordTooShort: "Your secret code needs more... secrecy. 8+ characters, please.",
    confirmPasswordRequired: "A little confirmation before we carve it in stone.",
    passwordsDontMatch: "These passwords had an argument. They don't match.",
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState("");
  const [authStatus, setAuthStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const router = useRouter();

  useEffect(() => {
    // Check authentication status via API (checks httpOnly cookie)
    const checkAuth = async () => {
      try {
        const res = await apiFetch("/api/auth/check");
        if (res.status === 200 && res.data?.authenticated) {
          setAuthStatus("authed");
          router.push("/dashboard");
        } else {
          setAuthStatus("unauthed");
        }
      } catch {
        setAuthStatus("unauthed");
      }
    };

    checkAuth();
  }, [router]);

  const isFormInvalid = useMemo(() => {
    if (!email || !password) return true;
    if (mode === "signup" && (!confirmPassword || password !== confirmPassword)) {
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return true;

    return false;
  }, [email, password, confirmPassword, mode]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { errors: errorCopy } = copyStrings;

    if (!email) {
      errors.email = errorCopy.emailRequired;
    } else if (!emailRegex.test(email)) {
      errors.email = errorCopy.emailInvalid;
    }

    if (!password) {
      errors.password = errorCopy.passwordRequired;
    } else if (mode === "signup" && password.length < 8) {
        errors.password = errorCopy.passwordTooShort;
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        errors.confirmPassword = errorCopy.confirmPasswordRequired;
      } else if (password !== confirmPassword) {
        errors.confirmPassword = errorCopy.passwordsDontMatch;
      }
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await apiFetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: { email, password },
      });

      if (res.status < 200 || res.status >= 300) {
        const errorMessage = typeof res.data === "string" ? res.data : res.data?.message || "An unexpected error occurred.";
        throw new Error(errorMessage);
      }

      // Clear any guest data since user is now authenticated
      clearGuestData();

      // No need to store token - it's in httpOnly cookie
      // Just redirect to dashboard
      router.push("/dashboard");

    } catch (e: unknown) {
      let message = "An unknown error occurred.";
      if (e instanceof Error) {
        // @ts-expect-error: response may exist on some error types
        message = e.response?.data?.message ?? e.response?.data ?? e.message;
      }
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setClientErrors({});
    setServerError("");
  };

  const handleGuestLogin = async () => {
    getGuestId();
    router.push("/dashboard");
  }

  if (authStatus !== "unauthed") {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl animate-pulse">
        Logging you in...
      </div>
    );
  }

  const currentCopy = copyStrings[mode];

  return (
    <main className="flex items-center justify-center min-h-[calc(100dvh-70px)] p-4 bg-gray-50">

      <div className="card w-full max-w-md max-h-[95dvh] flex flex-col">

        {/* Back to Home Link */}
        <div className="p-4 pb-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        <div className="overflow-y-auto p-4 sm:p-8">

          <div className="space-y-6">

            {/* Header Section */}
            <div className="text-center">
              <WinningSonImage />
              <h1 className="text-3xl font-extrabold mt-4">{`Are ya winnin, son?`}</h1>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 z-10" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`input pl-10 ${clientErrors.email ? 'input-error' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentCopy.emailPlaceholder}
                    disabled={loading}
                  />
                </div>
                {clientErrors.email && <p className="text-red-600 text-sm mt-1">{clientErrors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 z-10" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`input pl-10 pr-10 ${clientErrors.password ? 'input-error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentCopy.passwordPlaceholder}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {clientErrors.password && <p className="text-red-600 text-sm mt-1">{clientErrors.password}</p>}
              </div>

              {/* Confirm Password Field (Signup only) */}
              {mode === "signup" && (
                <div>
                  <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400 z-10" />
                      </span>
                      <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`input pl-10 pr-10 ${clientErrors.confirmPassword ? 'input-error' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={mode === "signup" ? copyStrings.signup.confirmPasswordPlaceholder : ""}
                      disabled={loading}
                      />
                  </div>
                  {clientErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{clientErrors.confirmPassword}</p>}
                </div>
              )}

              {serverError && <p className="text-red-600 text-sm text-center">{serverError}</p>}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading || isFormInvalid}
                  className="btn w-full sm:w-auto flex-grow"
                >
                  {loading ? "Loading..." : currentCopy.submitButton}
                </button>
                <button
                  type="button"
                  className="text-sm underline hover:opacity-75"
                  onClick={toggleMode}
                  disabled={loading}
                >
                  {currentCopy.toggleModeText}
                </button>
              </div>
            </form>

            {/* Guest Login Section */}
            <div className="space-y-4">
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">No Account? No Problem.</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={handleGuestLogin}
                    disabled={loading}
                >
                    Peek Inside (Continue as Guest)
                </button>
            </div>

            {/* Help Link */}
            <div className="text-center pt-2">
              <Link
                href="/help"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Need Help?
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
