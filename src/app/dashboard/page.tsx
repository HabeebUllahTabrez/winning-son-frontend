// src/app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, fetchFeatureStatus } from "@/lib/api";
import { getAvatarFile } from "@/lib/avatars";
import { StatCard } from "./_components/StatCard";
import { TrendChart } from "./_components/TrendChart";
import { CallToAction } from "./_components/CallToAction";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import { SubmissionHistoryChart } from "./_components/SubmissionHistoryChart";
import { ProfileSetupGuard } from "@/components/ProfileSetupGuard";
import OnboardingBanner from "@/components/OnboardingBanner";
import { FaCalendarCheck, FaChartLine, FaFire, FaFlagCheckered, FaLock, FaStar, FaWhatsapp, FaQuestionCircle, FaCommentDots, FaTrophy, FaCalendar, FaArrowUp, FaArrowDown, FaClock, FaHourglassHalf } from "react-icons/fa";
import { formatDateForAPI } from "@/lib/dateUtils";
import { isGuestUser } from "@/lib/guest";
import { trackEvent } from "@/lib/mixpanel";
import {
  getOnboardingStatus,
  shouldShowFirstLogCue,
  shouldShowAnalyzerCue,
  syncOnboardingStatusFromAPI,
  saveOnboardingStatus
} from "@/lib/onboarding";

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
    reference_date: string;
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
    longest_streak_ever: number;
    total_days_logged: number;
    peak_performance_day_of_week: string;
    last_week_karma: number;
    karma_change_vs_last_week: number;
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
    const [showFirstLogBanner, setShowFirstLogBanner] = useState(false);
    const [showAnalyzerBanner, setShowAnalyzerBanner] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        // --- UPDATED GUEST USER LOGIC ---
        if (isGuest) {
            // Simulate network delay
            setTimeout(() => {
                const guestStatsJson = localStorage.getItem("guestStats");
                if (guestStatsJson) {
                    const storedStats = JSON.parse(guestStatsJson);
                    
                    // Transform localStorage data into the consistent DashboardData shape.
                    // This handles data from both the old "_points" and new "_karma" format.
                    const transformedStats: DashboardData = {
                        reference_date: storedStats.reference_date || new Date().toISOString().split('T')[0],
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
                        longest_streak_ever: storedStats.longest_streak_ever ?? 0,
                        total_days_logged: storedStats.total_days_logged ?? 0,
                        peak_performance_day_of_week: storedStats.peak_performance_day_of_week || "N/A",
                        last_week_karma: storedStats.last_week_karma ?? 0,
                        karma_change_vs_last_week: storedStats.karma_change_vs_last_week ?? 0,
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
        trackEvent("Dashboard Viewed", { isGuest });
    }, [loadDashboard, isGuest]);

    // Load onboarding status
    useEffect(() => {
        const loadOnboardingStatus = async () => {
            if (isGuest) {
                // For guest users, check localStorage only
                const localStatus = getOnboardingStatus();
                setShowFirstLogBanner(shouldShowFirstLogCue());
                setShowAnalyzerBanner(shouldShowAnalyzerCue());
            } else {
                // For authenticated users, sync with API
                try {
                    const apiStatus = await fetchFeatureStatus();
                    if (apiStatus) {
                        syncOnboardingStatusFromAPI(apiStatus);
                        setShowFirstLogBanner(!apiStatus.has_created_first_log);
                        setShowAnalyzerBanner(apiStatus.has_created_first_log && !apiStatus.has_used_analyzer);
                    } else {
                        // Fallback to localStorage if API fails
                        setShowFirstLogBanner(shouldShowFirstLogCue());
                        setShowAnalyzerBanner(shouldShowAnalyzerCue());
                    }
                } catch (error) {
                    console.error("Failed to load onboarding status", error);
                    // Fallback to localStorage
                    setShowFirstLogBanner(shouldShowFirstLogCue());
                    setShowAnalyzerBanner(shouldShowAnalyzerCue());
                }
            }
        };

        loadOnboardingStatus();
    }, [isGuest]);

    const handleDismissBanner = (type: "first-log" | "analyzer") => {
        if (type === "first-log") {
            setShowFirstLogBanner(false);
            trackEvent("Onboarding Banner Dismissed", { type: "first-log", isGuest });
        } else {
            setShowAnalyzerBanner(false);
            trackEvent("Onboarding Banner Dismissed", { type: "analyzer", isGuest });
        }
    };

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

        // Calculate days
        const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.ceil(elapsedDuration / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysElapsed);

        return {
            percentage: Math.max(0, Math.min(100, percentage)),
            totalDays,
            daysElapsed,
            daysRemaining
        };
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
                                Here&apos;s your progress at a glance. Keep it up! ✨
                            </p>
                        </div>
                    </header>

                    {/* Onboarding Banners */}
                    {showFirstLogBanner && (
                        <OnboardingBanner type="first-log" onDismiss={() => handleDismissBanner("first-log")} />
                    )}
                    {showAnalyzerBanner && (
                        <OnboardingBanner type="analyzer" onDismiss={() => handleDismissBanner("analyzer")} />
                    )}

                    <CallToAction hasEntryToday={dashboardData?.has_today_entry || false} />

                    {/* Unlocked Stats for Guest */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Activity</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatCard title="Current Streak" value={`${dashboardData?.current_streak_days || 0} days`} icon={<FaFire className="text-orange-500" />} />
                            <StatCard title="Entries This Week" value={dashboardData?.entries_this_week || 0} icon={<FaCalendarCheck className="text-blue-500" />} />
                        </div>
                    </section>

                    {/* Also show SubmissionHistory for Guest */}
                    <section className="card p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission History</h2>
                        <p className="text-gray-600 mb-4">Track your journal entries over time (max 1 year)</p>
                        <SubmissionHistoryChart
                            isGuest={isGuest}
                            journalEntries={(() => {
                                const entries = JSON.parse(localStorage.getItem("guestJournalEntries") || "[]") as Array<{ localDate: string }>;
                                return entries.map((entry) => ({
                                    local_date: entry.localDate,
                                    has_submission: true
                                }));
                            })()}
                        />
                    </section>
                    
                    {/* Quick Links for Guest */}
                    <section className="card p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Links & Support</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/submissions" className="btn-secondary text-lg flex items-center justify-center gap-2">
                                <FaCalendarCheck /> View All Entries
                            </a>
                            <a
                                href="/help"
                                className="btn-secondary text-lg flex items-center justify-center gap-2"
                            >
                                <FaQuestionCircle /> Help & Guide
                            </a>
                            <a
                                href="https://chat.whatsapp.com/your-community-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-lg flex items-center justify-center gap-2 hover:bg-green-50"
                            >
                                <FaWhatsapp /> WhatsApp Community
                            </a>
                            <a
                                href="https://forms.gle/your-google-form-link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-lg flex items-center justify-center gap-2 hover:bg-purple-50 sm:col-span-2"
                            >
                                <FaCommentDots /> Have a Query? Contact Us
                            </a>
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

    // Helper function to generate encouraging messages based on performance
    const getEncouragingMessage = () => {
        const change = dashboardData.karma_change_vs_last_week;
        if (change > 20) return "You're on fire! What a week!";
        if (change > 10) return "Great momentum! Keep crushing it!";
        if (change > 0) return "Nice progress! You're moving up!";
        if (change === 0) return "Steady as she goes! Consistency is key!";
        if (change > -10) return "Small dip, but you've got this!";
        return "Every champion has off weeks. Bounce back strong!";
    };

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
                                {getEncouragingMessage()}
                            </p>
                        </div>
                    </header>

                    {/* Onboarding Banners */}
                    {showFirstLogBanner && (
                        <OnboardingBanner type="first-log" onDismiss={() => handleDismissBanner("first-log")} />
                    )}
                    {showAnalyzerBanner && (
                        <OnboardingBanner type="analyzer" onDismiss={() => handleDismissBanner("analyzer")} />
                    )}

                    <CallToAction hasEntryToday={dashboardData.has_today_entry} />

                    {/* ========== LONG TERM PROGRESS ========== */}
                    {user.goal && (
                        <section className="card p-6 space-y-6">
                            {/* Goal Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-gray-600 mb-1">Your Goal Journey</h2>
                                    <p className="text-3xl font-bold text-gray-900">{user.goal}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg border-2 border-black" style={{ boxShadow: '4px 4px 0px #000' }}>
                                    <FaTrophy className="text-3xl text-white" />
                                </div>
                            </div>

                            {goalProgress !== null && (
                                <>
                                    {/* Progress Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        <div className="bg-blue-50 p-2 sm:p-4 border-2 border-black" style={{ borderRadius: '4px 5px 3px 6px', boxShadow: '4px 4px 0px #000' }}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <FaClock className="text-blue-600 flex-shrink-0 text-sm sm:text-base" />
                                                <p className="text-xs font-bold text-gray-800 uppercase">Elapsed</p>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{goalProgress.daysElapsed}</p>
                                            <p className="text-xs text-gray-600">days</p>
                                        </div>

                                        <div className="bg-green-50 p-2 sm:p-4 border-2 border-black" style={{ borderRadius: '5px 4px 6px 3px', boxShadow: '4px 4px 0px #000' }}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <FaHourglassHalf className="text-green-600 flex-shrink-0 text-sm sm:text-base" />
                                                <p className="text-xs font-bold text-gray-800 uppercase">Remaining</p>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{goalProgress.daysRemaining}</p>
                                            <p className="text-xs text-gray-600">days</p>
                                        </div>

                                        <div className="bg-purple-50 p-2 sm:p-4 border-2 border-black" style={{ borderRadius: '3px 6px 4px 5px', boxShadow: '4px 4px 0px #000' }}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <FaCalendar className="text-purple-600 flex-shrink-0 text-sm sm:text-base" />
                                                <p className="text-xs font-bold text-gray-800 uppercase">Total</p>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{goalProgress.totalDays}</p>
                                            <p className="text-xs text-gray-600">days</p>
                                        </div>
                                    </div>

                                    {/* Visual Timeline */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm font-bold text-gray-800">
                                            <span>{goalProgress.percentage}% Complete</span>
                                            <span>{100 - goalProgress.percentage}% to go</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="relative">
                                            <div className="w-full bg-gray-100 h-8 border-2 border-black" style={{ borderRadius: '4px 5px 3px 6px' }}>
                                                <div
                                                    className="h-full transition-all duration-700 relative overflow-hidden"
                                                    style={{
                                                        width: `${goalProgress.percentage}%`,
                                                        borderRadius: '2px 3px 1px 4px',
                                                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
                                                    }}
                                                >
                                                    {/* Animated stripe pattern */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                                                </div>
                                            </div>

                                            {/* Current position marker */}
                                            {goalProgress.percentage > 0 && goalProgress.percentage < 100 && (
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
                                                    style={{ left: `${goalProgress.percentage}%` }}
                                                >
                                                    <div className="relative">
                                                        <div className="w-4 h-4 bg-yellow-400 border-2 border-black rounded-full" style={{ boxShadow: '2px 2px 0px #000' }}></div>
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 font-bold" style={{ borderRadius: '2px 3px 2px 3px' }}>
                                                            Today
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline Dates */}
                                        <div className="flex justify-between items-start pt-2">
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                                    <FaCalendarCheck className="text-lg" />
                                                    <span className="text-xs font-bold uppercase">Start Date</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{formatDateForDisplay(user.start_date)}</span>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2 text-red-600 mb-1">
                                                    <span className="text-xs font-bold uppercase">Target Date</span>
                                                    <FaFlagCheckered className="text-lg" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{formatDateForDisplay(user.end_date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Motivational Message */}
                                    <div className="bg-yellow-50 border-2 border-black p-4" style={{ borderRadius: '4px 5px 3px 6px' }}>
                                        <p className="text-center text-gray-900 font-bold">
                                            {goalProgress.percentage < 25 && "Just getting started! Every day counts toward your goal!"}
                                            {goalProgress.percentage >= 25 && goalProgress.percentage < 50 && "Quarter way there! You're building momentum!"}
                                            {goalProgress.percentage >= 50 && goalProgress.percentage < 75 && "Over halfway! Keep pushing forward!"}
                                            {goalProgress.percentage >= 75 && goalProgress.percentage < 90 && "The finish line is in sight! Stay focused!"}
                                            {goalProgress.percentage >= 90 && goalProgress.percentage < 100 && "Almost there! Give it your all!"}
                                            {goalProgress.percentage >= 100 && "Goal period complete! Time to set a new target!"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </section>
                    )}

                    {/* ========== CURRENT WEEK ========== */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">This Week</h2>
                            <p className="text-gray-600 mb-6">Your performance over the last 7 days</p>
                        </div>

                        {/* Key Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <StatCard
                                title="Today's Karma"
                                value={dashboardData.day_karma.toFixed(2)}
                                icon={<FaCalendarCheck className="text-blue-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Current Streak"
                                value={`${dashboardData.current_streak_days} days`}
                                icon={<FaFire className="text-orange-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Week's Karma"
                                value={dashboardData.week_karma.toFixed(2)}
                                icon={<FaChartLine className="text-green-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Entries This Week"
                                value={dashboardData.entries_this_week}
                                icon={<FaCalendarCheck className="text-purple-500" />}
                                isSmall={true}
                            />
                        </div>

                        {/* Week-over-Week Comparison */}
                        {dashboardData.last_week_karma > 0 && (
                            <div className="card p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Week-over-Week</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">Last Week</p>
                                        <p className="text-3xl font-bold text-gray-900">{dashboardData.last_week_karma.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">This Week</p>
                                        <p className="text-3xl font-bold text-gray-900">{dashboardData.week_karma.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">Change</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-3xl font-bold ${dashboardData.karma_change_vs_last_week >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {dashboardData.karma_change_vs_last_week >= 0 ? '+' : ''}{dashboardData.karma_change_vs_last_week.toFixed(1)}%
                                            </p>
                                            {dashboardData.karma_change_vs_last_week >= 0 ? (
                                                <FaArrowUp className="text-green-600 text-xl" />
                                            ) : (
                                                <FaArrowDown className="text-red-600 text-xl" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7-Day Trend Chart */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">7-Day Trend</h3>
                            <div className="h-72">
                                <TrendChart data={dashboardData.last7_days_trend} />
                            </div>
                        </div>
                    </section>

                    {/* ========== OVERALL STATS ========== */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Overall Stats</h2>

                        {/* Combined Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                            <StatCard
                                title="Year Total"
                                value={dashboardData.year_karma.toFixed(2)}
                                icon={<FaChartLine className="text-green-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Entries This Year"
                                value={dashboardData.entries_this_year}
                                icon={<FaCalendarCheck className="text-blue-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Monthly Average"
                                value={dashboardData.average_month_karma?.toFixed(2)}
                                icon={<FaStar className="text-yellow-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Longest Streak"
                                value={`${dashboardData.longest_streak_ever} days`}
                                icon={<FaTrophy className="text-yellow-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Total Days Logged"
                                value={dashboardData.total_days_logged}
                                icon={<FaCalendar className="text-purple-500" />}
                                isSmall={true}
                            />
                            <StatCard
                                title="Best Day"
                                value={dashboardData.peak_performance_day_of_week}
                                icon={<FaStar className="text-pink-500" />}
                                isSmall={true}
                            />
                        </div>

                        {/* Submission History Calendar */}
                        <div className="card p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Activity Calendar</h3>
                            <p className="text-gray-600 mb-4">Track your consistency over time</p>
                            <SubmissionHistoryChart isGuest={false} />
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="card p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a href="/submissions" className="btn-secondary text-lg flex items-center justify-center gap-2">
                                <FaCalendarCheck /> View All Entries
                            </a>
                            <a href="/analyzer" className="btn-secondary text-lg flex items-center justify-center gap-2">
                                <FaChartLine /> Open Analyzer
                            </a>
                            <a
                                href="/help"
                                className="btn-secondary text-lg flex items-center justify-center gap-2"
                            >
                                <FaQuestionCircle /> Help & Guide
                            </a>
                            <a
                                href="https://chat.whatsapp.com/KJQdLKOXZYh3M6aRzLnMQD"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-lg flex items-center justify-center gap-2 hover:bg-green-50"
                            >
                                <FaWhatsapp /> WhatsApp Community
                            </a>
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSdYfPojaZjr_j3SDM8ODkVTzX34Cch6xivOpmfq-_ZIJnEUEw/viewform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-lg flex items-center justify-center gap-2 hover:bg-purple-50 sm:col-span-2"
                            >
                                <FaCommentDots /> Facing an Issue? Contact Us
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </ProfileSetupGuard>
    );
}
