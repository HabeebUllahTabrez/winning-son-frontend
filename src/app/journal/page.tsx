// src/app/journal/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function Journal() {
    const [topics, setTopics] = useState("");
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    function authHeader() {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return { Authorization: `Bearer ${token}` } as const;
    }

    async function submit() {
        setSuccessMsg("");
        setErrorMsg("");
        setLoading(true);
        try {
			//2025-01-01
			const local_date = new Date().toISOString().split('T')[0];
            const res = await apiFetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ topics, rating, local_date }),
            });
            if (!res.ok) throw new Error(await res.text());
            setSuccessMsg("Saved today’s entry successfully!");
            setTopics("");
            setRating(5);
        } catch (e: unknown) {
            setErrorMsg(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    }

    const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-bold">Today&apos;s Journal</h1>
                    <p className="text-lg text-gray-600">Log your progress and how you felt about it.</p>
                </header>

                <div className="card space-y-6">
                    {/* Topics Covered Section */}
                    <div>
                        <label htmlFor="topics" className="block text-2xl font-bold mb-2">
                            Topics Covered
                        </label>
                        <textarea
                            id="topics"
                            className="input w-full min-h-[150px] text-lg"
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            placeholder="What did you work on today? e.g., Next.js routing, database schemas..."
                            disabled={loading}
                        />
                    </div>

                    {/* Satisfaction Rating Section */}
                    <div>
                        <label className="block text-2xl font-bold mb-3">
                            Satisfaction Rating ({rating}/10)
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            {ratingOptions.map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setRating(num)}
                                    disabled={loading}
                                    className={`w-12 h-12 text-lg font-bold border-2 border-black rounded-full transition-colors duration-200
                                        ${rating === num
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <button className="btn text-lg" onClick={submit} disabled={loading}>
                            {loading ? "Saving..." : "Save Entry"}
                        </button>
                        <Link className="text-lg underline" href="/dashboard">
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* Success and Error Messages */}
                    {successMsg && (
                        <div className="p-4 border-2 border-green-700 bg-green-50 rounded-lg">
                            <p className="text-green-800 font-bold">{successMsg}</p>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="p-4 border-2 border-red-700 bg-red-50 rounded-lg">
                            <p className="text-red-800 font-bold">{errorMsg}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
