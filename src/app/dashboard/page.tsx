// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getAvatarFile } from "@/lib/avatars"; // 1. Import the new utility
import { StatCard } from "./_components/StatCard";
import { TrendChart } from "./_components/TrendChart";
import { CallToAction } from "./_components/CallToAction";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { FaCalendarCheck, FaChartLine, FaFire, FaStar } from "react-icons/fa";

// 2. Define nested User type and update DashboardData
type User = {
    first_name: string | null;
    avatar_id: number | null;
    goal: string | null;
    start_date: string | null;
    end_date: string | null;
};

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
    user: User; // Add the user object
};

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const authHeader = useCallback(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return undefined;
        return { Authorization: `Bearer ${token}` };
    }, []);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const today = new Date().toISOString().split("T")[0];
            const res = await apiFetch(`/api/dashboard?local_date=${today}`, {
                headers: authHeader(),
            });
            if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
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

    // 3. Memoize goal progress calculation
    const goalProgress = useMemo(() => {
        if (!dashboardData?.user.start_date || !dashboardData?.user.end_date) {
            return null;
        }
        const start = new Date(dashboardData.user.start_date).getTime();
        const end = new Date(dashboardData.user.end_date).getTime();
        const now = new Date().getTime();

        if (start >= end) return null;

        const totalDuration = end - start;
        const elapsedDuration = now - start;
        const percentage = Math.round((elapsedDuration / totalDuration) * 100);

        return Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
    }, [dashboardData?.user]);


    if (loading) return <DashboardSkeleton />;
    
    if (error || !dashboardData) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-10 text-center">
                 <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <div className="card border-red-500 text-red-700">
                    <p className="font-bold">Could not load your dashboard:</p>
                    <p>{error || "No data was returned."}</p>
                    <button onClick={loadDashboard} className="btn mt-4">Try Again</button>
                </div>
            </div>
        );
    }

    const { user } = dashboardData;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="space-y-12">
                {/* 4. New Personalized Header */}
                <header className="flex items-center gap-4">
                    <img
                        src={`/avatars/${getAvatarFile(user.avatar_id)}`}
                        alt="User Avatar"
                        className="w-20 h-20 rounded-full border-4 border-black bg-gray-100 object-cover"
                    />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Welcome back, {user.first_name || 'friend'}!
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">
                            Here’s your progress at a glance. Keep it up! ✨
                        </p>
                    </div>
                </header>

                <CallToAction hasEntryToday={dashboardData.has_today_entry} />

                {/* 5. New Goal Progress Section */}
                {user.goal && (
                    <section className="card p-6 space-y-3">
                        <h2 className="text-xl font-bold text-gray-800">Your Current Goal</h2>
                        <p className="text-3xl font-bold">{user.goal}</p>
                        {goalProgress !== null && (
                            <div>
                                <div className="w-full bg-gray-100 h-6 rounded-full border-2 border-black">
                                    <div 
                                        className="bg-black h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${goalProgress}%` }} 
                                    />
                                </div>
                                <p className="text-right font-bold text-md mt-1">{goalProgress}% complete</p>
                            </div>
                        )}
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Stats</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <StatCard title="Today's Points" value={dashboardData.day_points} icon={<FaCalendarCheck className="text-blue-500" />} />
                        <StatCard title="Current Streak" value={`${dashboardData.current_streak_days} days`} icon={<FaFire className="text-orange-500" />} />
                        <StatCard title="Points This Week" value={dashboardData.week_points} icon={<FaChartLine className="text-green-500" />} />
                    </div>
                </section>

                <section className="card p-6">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Last 7 Days</h2>
                    <div className="h-72">
                        <TrendChart data={dashboardData.last7_days_trend} />
                    </div>
                </section>
                
                <section>
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">More Stats</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <StatCard title="Monthly Average Rating" value={dashboardData.average_month_rating.toFixed(1)} icon={<FaStar className="text-yellow-500" />} isSmall={true} />
                        <StatCard title="Entries This Week" value={dashboardData.entries_this_week} isSmall={true} />
                        <StatCard title="Total Points This Year" value={dashboardData.year_points} isSmall={true} />
                    </div>
                </section>

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
