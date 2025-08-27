// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatCard } from "./_components/StatCard";
import { TrendChart } from "./_components/TrendChart";
import { CallToAction } from "./_components/CallToAction";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { FaCalendarCheck, FaChartLine, FaFire, FaStar } from "react-icons/fa";

// 1. Define a type that matches the API response
type DashboardData = {
    has_today_entry: boolean;
    day_points: number;
    week_points: number;
    month_points: number;
    year_points: number;
    entries_this_week: number;
    entries_this_year: number;
    average_month_rating: number;
    current_streak_days: number;
    last7_days_trend: { local_date: string; points: number }[];
};

export default function Dashboard() {
    // 2. Update state to use the new data type
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const authHeader = useCallback(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
            // Handle not-logged-in case if necessary, e.g., redirect
            return {};
        }
        return { Authorization: `Bearer ${token}` } as const;
    }, []);

    // 3. Refactor the load function for the new endpoint
    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD
            const res = await apiFetch(`/api/dashboard?local_date=${today}`, {
                headers: authHeader(),
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
            }

            const data: DashboardData = await res.json();
            setDashboardData(data);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [authHeader]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // Use the new skeleton component
    if (loading) {
        return <DashboardSkeleton />;
    }
    
    // Handle error state
    if (error || !dashboardData) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-10 text-center">
                 <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <div className="card border-red-500 text-red-700">
                    <p className="font-bold">Could not load your dashboard:</p>
                    <p>{error || "No data was returned."}</p>
                    <button onClick={loadDashboard} className="btn mt-4">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="space-y-12">
                <header>
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-lg text-gray-600 mt-1">
                        Here’s your progress at a glance. Keep it up! ✨
                    </p>
                </header>

                {/* Main Call to Action */}
                <CallToAction hasEntryToday={dashboardData.has_today_entry} />

                {/* 4. Display key stats using the new StatCard component */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Today's Points"
                            value={dashboardData.day_points}
                            icon={<FaCalendarCheck className="text-blue-500" />}
                        />
                        <StatCard
                            title="Current Streak"
                            value={`${dashboardData.current_streak_days} days`}
                            icon={<FaFire className="text-orange-500" />}
                        />
                         <StatCard
                            title="Points This Week"
                            value={dashboardData.week_points}
                            icon={<FaChartLine className="text-green-500" />}
                        />
                    </div>
                </section>

                {/* 5. Display the 7-day trend using the new TrendChart component */}
                <section className="card p-6">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Last 7 Days</h2>
                    <div className="h-72">
                        <TrendChart data={dashboardData.last7_days_trend} />
                    </div>
                </section>
                
                {/* Additional Stats Section */}
                <section>
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">More Stats</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Monthly Average Rating"
                            value={dashboardData.average_month_rating.toFixed(1)}
                            icon={<FaStar className="text-yellow-500" />}
                            isSmall={true}
                        />
                        <StatCard
                            title="Entries This Week"
                            value={dashboardData.entries_this_week}
                            isSmall={true}
                        />
                        <StatCard
                            title="Total Points This Year"
                            value={dashboardData.year_points}
                            isSmall={true}
                        />
                    </div>
                </section>

                {/* Navigation Section */}
                <section className="card p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <a href="/submissions" className="btn-secondary text-lg">View All Entries</a>
                        <a href="/analyzer" className="btn-secondary text-lg">Open Analyzer</a>
                    </div>
                </section>
            </div>
        </div>
    );
}
