// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getAvatarFile } from "@/lib/avatars";
import { StatCard } from "./_components/StatCard";
import { TrendChart } from "./_components/TrendChart";
import { CallToAction } from "./_components/CallToAction";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { SubmissionHistoryChart } from "./_components/SubmissionHistoryChart";
import { ProfileSetupGuard } from "@/components/ProfileSetupGuard";
import { FaCalendarCheck, FaChartLine, FaFire, FaFlagCheckered, FaLock, FaStar } from "react-icons/fa";
import { formatDateForAPI } from "@/lib/dateUtils";
import { isGuestUser } from "@/lib/guest";

// Define nested User type
type User = {
    first_name: string | null;
    avatar_id: number | null;
    goal: string | null;
    start_date: string | null;
    end_date: string | null;
};

// This type now correctly represents data from BOTH the API and the guest stats
type DashboardData = {
    has_today_entry: boolean;
    day_karma: number;
    week_karma: number;
    month_karma: number;
    year_karma: number;
    entries_this_week: number;
    entries_this_year: number;
    average_month_karma: number;
    current_streak_days: number;
    last7_days_trend: { local_date: string; karma: number }[];
    user: User;
};

// Helper to format dates for display
const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function Dashboard() {
    const isGuest = isGuestUser();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        // --- UPDATED GUEST USER LOGIC ---
        if (isGuest) {
            console.log("Loading and transforming dashboard for guest user from localStorage.");
            // Simulate network delay
            setTimeout(() => {
                const guestStatsJson = localStorage.getItem("guestStats");
                if (guestStatsJson) {
                    const storedStats = JSON.parse(guestStatsJson);
                    
                    // Transform localStorage data into the consistent DashboardData shape.
                    // This handles data from both the old "_points" and new "_karma" format.
                    const transformedStats: DashboardData = {
                        has_today_entry: storedStats.has_today_entry,
                        current_streak_days: storedStats.current_streak_days,
                        entries_this_week: storedStats.entries_this_week,
                        entries_this_year: storedStats.entries_this_year,
                        day_karma: storedStats.day_karma ?? storedStats.day_points ?? 0,
                        week_karma: storedStats.week_karma ?? storedStats.week_points ?? 0,
                        month_karma: storedStats.month_karma ?? storedStats.month_points ?? 0,
                        year_karma: storedStats.year_karma ?? storedStats.year_points ?? 0,
                        average_month_karma: storedStats.average_month_karma ?? storedStats.average_month_rating ?? 0,
                        last7_days_trend: (storedStats.last7_days_trend || []).map((day: { local_date: string; karma?: number; points?: number }) => ({
                            local_date: day.local_date,
                            karma: day.karma ?? day.points ?? 0,
                        })),
                        user: storedStats.user || { first_name: "Guest", avatar_id: 1, goal: null, start_date: null, end_date: null },
                    };
                    setDashboardData(transformedStats);
                } else {
                    setDashboardData(null); // No stats found for guest
                }
                setLoading(false);
            }, 500);
            return;
        }

        // --- LOGGED-IN USER LOGIC ---
        try {
            const today = formatDateForAPI(new Date());
            const res = await apiFetch(`/api/dashboard?local_date=${today}`);
            if (res.status !== 200) throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
            const data: DashboardData = res.data;
            setDashboardData(data);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [isGuest]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

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

        return Math.max(0, Math.min(100, percentage));
    }, [dashboardData?.user]);
    
    if (loading) return <DashboardSkeleton />;

    // --- Hybrid Guest Dashboard View ---
    if (isGuest) {
        return (
            <ProfileSetupGuard>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="space-y-12">
                    <header className="flex items-center gap-4">
                        <img
                            src={`/avatars/${getAvatarFile(dashboardData?.user.avatar_id || 1)}`}
                            alt="User Avatar"
                            className="w-20 h-20 rounded-full border-4 border-black bg-gray-100 object-cover"
                        />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Welcome, {dashboardData?.user.first_name || 'friend'}!
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">
                                Here’s your progress at a glance. Keep it up! ✨
                            </p>
                        </div>
                    </header>

                    <CallToAction hasEntryToday={dashboardData?.has_today_entry || false} />

                    {/* Unlocked Stats for Guest */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Activity</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatCard title="Current Streak" value={`${dashboardData?.current_streak_days || 0} days`} icon={<FaFire className="text-orange-500" />} />
                            <StatCard title="Entries This Week" value={dashboardData?.entries_this_week || 0} icon={<FaCalendarCheck className="text-blue-500" />} />
                        </div>
                    </section>
                    
                    {/* Locked Stats for Guest */}
                    <div className="relative pt-6">
                        <div className="absolute -inset-x-4 -inset-y-6 z-10 bg-white/30 backdrop-blur-sm rounded-lg"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="bg-white/80 p-8 rounded-xl text-center shadow-lg border max-w-md">
                                <FaLock className="text-5xl text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800">Unlock Karma Analytics</h2>
                                <p className="text-gray-600 mt-2 mb-6">
                                    Sign up to track your Karma score, visualize trends, and set goals.
                                </p>
                                <a href="/profile" className="btn text-lg">
                                    Create a Free Account
                                </a>
                            </div>
                        </div>
                        
                        <div className="space-y-8 pointer-events-none">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Karma Stats</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                                </div>
                            </section>
                            <section className="h-72 bg-gray-200 rounded-lg"></section>
                        </div>
                    </div>
                </div>
            </div>
            </ProfileSetupGuard>
        );
    }
    
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

    // --- Logged-in User View ---
    return (
        <ProfileSetupGuard>
             <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="space-y-12">
                    <header className="flex items-center gap-4">
                        <img
                            src={`/avatars/${getAvatarFile(user.avatar_id)}`}
                            alt="User Avatar"
                            className="w-20 h-20 rounded-full border-4 border-black bg-gray-100 object-cover"
                        />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Welcome, {user.first_name || 'friend'}!
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">
                                Here’s your progress at a glance. Keep it up! ✨
                            </p>
                        </div>
                    </header>

                    <CallToAction hasEntryToday={dashboardData.has_today_entry} />

                    {user.goal && (
                        <section className="card p-6 space-y-4">
                             <div>
                                <h2 className="text-xl font-bold text-gray-800">Your Current Goal</h2>
                                <p className="text-3xl font-bold">{user.goal}</p>
                            </div>
                            {goalProgress !== null && (
                                <div className="pt-2 space-y-3">
                                    <div className="w-full bg-gray-100 h-6 rounded-full border-2 border-black">
                                        <div 
                                            className="bg-black h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${goalProgress}%` }} 
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-md font-bold">
                                        <span className="flex items-center gap-2">
                                            <FaCalendarCheck className="text-green-600" />
                                            Start: {formatDateForDisplay(user.start_date)}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FaFlagCheckered className="text-red-600" />
                                            End: {formatDateForDisplay(user.end_date)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Stats</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <StatCard title="Today's Karma" value={dashboardData.day_karma.toFixed(2)} icon={<FaCalendarCheck className="text-blue-500" />} />
                            <StatCard title="Current Streak" value={`${dashboardData.current_streak_days} days`} icon={<FaFire className="text-orange-500" />} />
                            <StatCard title="Karma This Week" value={dashboardData.week_karma.toFixed(2)} icon={<FaChartLine className="text-green-500" />} />
                        </div>
                    </section>

                    <section className="card p-6">
                         <h2 className="text-2xl font-bold text-gray-800 mb-4">Last 7 Days</h2>
                        <div className="h-72">
                            <TrendChart data={dashboardData.last7_days_trend} />
                        </div>
                    </section>

                    <section className="card p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission History</h2>
                        <p className="text-gray-600 mb-4">Track your journal entries over time (max 1 year)</p>
                        <SubmissionHistoryChart />
                    </section>
                    
                    <section>
                         <h2 className="text-2xl font-bold text-gray-800 mb-4">More Stats</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <StatCard title="Monthly Average Karma" value={dashboardData.average_month_karma?.toFixed(2)} icon={<FaStar className="text-yellow-500" />} isSmall={true} />
                            <StatCard title="Entries This Week" value={dashboardData.entries_this_week} isSmall={true} />
                            <StatCard title="Total Karma This Year" value={dashboardData.year_karma.toFixed(2)} isSmall={true} />
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
        </ProfileSetupGuard>
    );
}
