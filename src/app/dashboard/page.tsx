// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Summary = { today: number; thisWeek: number; thisMonth: number };

function DashboardSkeleton() {
    // Also wrapping the skeleton for consistency during load
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="space-y-10 animate-pulse">
                <header>
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <p className="text-lg text-gray-600">Loading your progress...</p>
                </header>
                
                <section className="card space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="w-full bg-gray-200 h-8 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card h-28 bg-gray-100"></div>
                    <div className="card h-28 bg-gray-100"></div>
                </section>

                <section className="card">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </section>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const authHeader = useCallback(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        return { Authorization: `Bearer ${token}` } as const;
    }, []);

    const load = useCallback(async () => {
        try {
            const res = await apiFetch("/api/progress", { headers: authHeader() });
            if (!res.ok) throw new Error(await res.text());
            const data: Summary = await res.json();
            setSummary(data);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to load dashboard data.";
            setError(message);
        }
    }, [authHeader]);

    useEffect(() => {
        load();
    }, [load]);

    async function add() {
        setError("");
        setLoading(true);
        try {
            const res = await apiFetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ amount }),
            });
            if (!res.ok) throw new Error(await res.text());
            setAmount(0);
            await load();
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to add progress.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    if (!summary) {
        return <DashboardSkeleton />;
    }

    const progressPercentage = Math.min(100, (summary.today / 100) * 100);

    return (
        // The new container for alignment and spacing
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="space-y-10">
                <header>
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <p className="text-lg text-gray-600">Here’s a look at your recent progress.</p>
                </header>

                {error && (
                    <div className="card border-red-500 text-red-700">
                        <p className="font-bold">An error occurred:</p>
                        <p>{error}</p>
                    </div>
                )}

                <section className="card space-y-4">
                    <h2 className="text-2xl font-bold">Today&apos;s Goal</h2>
                    <div className="w-full bg-gray-100 h-8 rounded-full border-2 border-black">
                        <div className="bg-black h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <p className="text-right font-bold text-lg">{summary.today} / 100</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Overall Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card flex flex-col items-center justify-center text-center p-6">
                            <span className="text-5xl font-bold">{summary.thisWeek}</span>
                            <span className="text-lg text-gray-600">This Week</span>
                        </div>
                        <div className="card flex flex-col items-center justify-center text-center p-6">
                            <span className="text-5xl font-bold">{summary.thisMonth}</span>
                            <span className="text-lg text-gray-600">This Month</span>
                        </div>
                    </div>
                </section>

                <section className="card space-y-4">
                    <h2 className="text-2xl font-bold">Log New Progress</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="number"
                            min={0}
                            className="input rounded px-3 py-2 w-32 text-lg"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value || "0"))}
                        />
                        <button onClick={add} disabled={loading} className="btn text-lg">
                            {loading ? "Saving..." : "Add Progress"}
                        </button>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Navigation</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <a href="/journal" className="btn text-lg">Today&apos;s Journal</a>
                        <a href="/submissions" className="btn text-lg">View Submissions</a>
                        <a href="/analyzer" className="btn text-lg">Open Analyzer</a>
                    </div>
                </section>
            </div>
        </div>
    );
}
