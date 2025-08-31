// app/page.tsx
"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
// NEW: Import the Next.js Image component for optimization
import Image from "next/image";

// NEW: A dedicated component for the thematic image.
// This uses the Next.js Image component for performance benefits.
const WinningSonImage = () => (
  <div className="relative w-48 h-48 mx-auto">
    <Image
      src="/are-ya-winning.jpeg" // Assumes your image is in the /public folder
      alt="A cartoon father peeking through a door, asking 'Are ya winning?'"
      layout="fill"
      objectFit="contain"
    />
  </div>
);

// NEW: Centralized copy for easy management and wit.
// const copyStrings = {
//   login: {
//     title: "Are ya winning?",
//     subtitle: "Dad's checking in. Log in to see your progress.",
//     emailPlaceholder: "your-gamertag@example.com",
//     passwordPlaceholder: "Your secret cheat code",
//     submitButton: "Check My Progress",
//     toggleModeText: "or create a new save file",
//   },
//   signup: {
//     title: "New Game?",
//     subtitle: "Let's get you set up to start winning. No pressure.",
//     emailPlaceholder: "The email dad has on file",
//     passwordPlaceholder: "Make it stronger than your wifi password",
//     confirmPasswordPlaceholder: "Enter the cheat code again",
//     submitButton: "Start Winning",
//     toggleModeText: "or I already have a save file",
//   },
//   errors: {
//     emailRequired: "Need your gamertag to find your save file.",
//     emailInvalid: "That email looks like it was entered with a joystick.",
//     passwordRequired: "Can't access your progress without the key.",
//     passwordTooShort: "Your cheat code needs to be at least 8 characters long.",
//     confirmPasswordRequired: "Gotta confirm that cheat code.",
//     passwordsDontMatch: "Your cheat codes are out of sync. Try again.",
//   }
// };

// NEW: Centralized copy focused on journaling, motivation, and witty humor.
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

export default function Home() {
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
    const token = localStorage.getItem("token");
    if (token) {
      setAuthStatus("authed");
      router.push("/dashboard");
    } else {
      setAuthStatus("unauthed");
    }
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

  // UPDATED: Validation uses witty error messages from the copyStrings object.
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
        const errorMessage = typeof res.data === "string" ? res.data : "An unexpected error occurred.";
        throw new Error(errorMessage);
      }

      const data: { token: string } = res.data;
      localStorage.setItem("token", data.token);
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
  
  // No changes needed to the loading state, it's already good.
  if (authStatus !== "unauthed") {
    return (
      <div className="flex items-center justify-center h-full text-xl animate-pulse">
        Checking your save file...
      </div>
    );
  }

  // Current mode's copy
  const currentCopy = copyStrings[mode];

  return (
    <main className="flex items-center justify-center h-full p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          {/* UPDATED: Using the new Image component */}
          <WinningSonImage />
          {/* <h1 className="text-5xl font-bold tracking-tight">{currentCopy.title}</h1>
          <p className="text-gray-600 text-lg">
            {currentCopy.subtitle}
          </p> */}
        </div>

        <div className="card shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium">Email</label>
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
              <label htmlFor="password" className="block text-lg font-medium">Password</label>
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
                <label htmlFor="confirm-password" className="block text-lg font-medium">Confirm Password</label>
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
            
            {serverError && <p className="text-red-600 text-lg text-center">{serverError}</p>}
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || isFormInvalid}
                className="btn w-full sm:w-auto"
              >
                {loading ? "Loading..." : currentCopy.submitButton}
              </button>
              <button
                type="button"
                className="text-md underline hover:opacity-75"
                onClick={toggleMode}
                disabled={loading}
              >
                {currentCopy.toggleModeText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
