// src/app/submissions/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Entry = { local_date: string; topics: string; rating: number };

function SubmissionsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="card h-36"></div>
            <div className="card h-36"></div>
            <div className="card h-36"></div>
        </div>
    );
}

export default function SubmissionsPage() {
    const [data, setData] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const authHeader = () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            return { Authorization: `Bearer ${token}` } as const;
        };

        const fetchSubmissions = async () => {
            try {
                const res = await apiFetch("/api/journal", { headers: authHeader() });
                if (!res.ok) throw new Error(await res.text());
                const body: Entry[] = await res.json();
                setData(body);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Failed to load submissions.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);
    
    const renderContent = () => {
        if (loading) {
            return <SubmissionsSkeleton />;
        }

        if (error) {
            return (
                <div className="card border-red-500 text-red-700">
                    <p className="font-bold">An error occurred:</p>
                    <p>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="card text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">No Journal Submissions Yet</h2>
                    <p className="text-gray-600 mb-4">Create your first entry to see it here.</p>
                    <Link href="/journal" className="btn text-lg">
                        Write in Journal
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {data.map((entry) => (
                    <div className="card" key={entry.local_date}>
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-black/10 pb-3 mb-3">
                            <span className="text-xl font-bold">{entry.local_date}</span>
                            <span className="text-lg font-bold bg-black text-white py-1 px-3 rounded-full">
                                Rating: {entry.rating}/10
                            </span>
                        </div>
                        <p className="whitespace-pre-wrap text-lg leading-relaxed">{entry.topics}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <header className="mb-8">
                <h1 className="text-4xl font-bold">Journal Submissions</h1>
                <p className="text-lg text-gray-600">A complete history of your journal entries.</p>
            </header>
            {renderContent()}
        </div>
    );
}
