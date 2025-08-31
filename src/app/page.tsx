// app/page.tsx
"use client";

import { apiFetch } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  async function submit() {
  setError("");
  setLoading(true);
  try {
    const res = await apiFetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: { email, password },
    });

    // If the response status is not in the 2xx range, read the error message and throw it.
    if (res.status < 200 || res.status >= 300) {
      const errorMessage = typeof res.data === "string" ? res.data : "An error occurred.";
      throw new Error(errorMessage);
    }

    // This part only runs if the response was successful
    const data: { token: string } = res.data;
    localStorage.setItem("token", data.token);
    router.push("/dashboard");

  } catch (e: unknown) {
    let message = "An unknown error occurred.";
    if (e instanceof Error) {
      // If the error has a response property (e.g., AxiosError), use it
      // @ts-expect-error: response may exist on some error types
      message = e.response?.data ?? e.message;
    }
    setError(message);
  } finally {
    setLoading(false);
  }
}

  if (authStatus !== "unauthed") {
    return (
      <div className="flex items-center justify-center h-full text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">What&apos;s the plan?</h1>
          <Image
            src="/are-ya-winning.jpeg"
            alt="Are ya winning, son?"
            width={128}
            height={128}
            className="mx-auto rounded-full object-cover border-4 border-black"
          />
        </div>

        <div className="card">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg font-medium">Email</label>
              <input
                id="email"
                type="email"
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-lg font-medium">Password</label>
              <input
                id="password"
                type="password"
                className="input mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p className="text-red-600 text-lg">{error}</p>}
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                disabled={loading}
                onClick={submit}
                className="btn w-full sm:w-auto"
              >
                {loading ? "..." : mode === "login" ? "Login" : "Sign up"}
              </button>
              <button
                className="text-md underline"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                or {mode === "login" ? "Sign up" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
