// src/app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Entry = { date: string; amount: number };

function ReportsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <header>
                <div className="h-9 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mt-2"></div>
            </header>
            <div className="card">
                <div className="w-full h-10 bg-gray-100 border-b-2 border-gray-200"></div>
                <div className="w-full h-12 bg-gray-50 border-b-2 border-gray-200"></div>
                <div className="w-full h-12 bg-gray-100 border-b-2 border-gray-200"></div>
                <div className="w-full h-12 bg-gray-50"></div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const [data, setData] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const authHeader = () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            return { Authorization: `Bearer ${token}` } as const;
        };

        const fetchReports = async () => {
            try {
                const res = await apiFetch("/api/progress/report", { headers: authHeader() });
                if (!res.ok) throw new Error(await res.text());
                const body: Entry[] = await res.json();
                setData(body);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Failed to load reports.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <ReportsSkeleton />;
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
                    <h2 className="text-2xl font-bold mb-2">No Progress Reports Found</h2>
                    <p className="text-gray-600 mb-4">Add your progress on the dashboard to generate reports.</p>
                    <Link href="/dashboard" className="btn text-lg">
                        Go to Dashboard
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <header>
                    <h1 className="text-4xl font-bold">Progress Reports</h1>
                    <p className="text-lg text-gray-600">A log of all your progress amounts.</p>
                </header>
                <div className="card p-0">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-black">
                            <tr>
                                <th className="p-4 text-xl font-bold">Date</th>
                                <th className="p-4 text-xl font-bold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((entry, index) => (
                                <tr key={entry.date} className={`border-b-2 border-black/10 ${index === data.length - 1 ? 'border-b-0' : ''}`}>
                                    <td className="p-4 text-lg">{entry.date}</td>
                                    <td className="p-4 text-lg font-bold">{entry.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            {renderContent()}
        </div>
    );
}
