'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SubmissionsClient from './_components/SubmissionsClient';
import clsx from 'clsx';

type ViewMode = 'daily' | 'weekly';

// Enhanced loading skeleton with shimmer effect
function SubmissionsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Navigation skeleton */}
            <div className="entry-card p-6">
                <div className="flex justify-between items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 mx-8">
                        <div className="h-8 bg-gray-200 rounded-lg max-w-xs mx-auto animate-pulse" />
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-center gap-3 mt-6">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </div>
            
            {/* Entry skeleton */}
            <div className="entry-card p-8">
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
                <div className="flex gap-4 mt-8">
                    <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function SubmissionsContent() {
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    
    // Initialize viewMode from URL param if present, otherwise default to 'weekly'
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (viewParam === 'daily' || viewParam === 'weekly') {
            return viewParam;
        }
        return 'weekly';
    });

    // Sync viewMode with URL changes (e.g., when navigating from dashboard chart)
    useEffect(() => {
        if (viewParam === 'daily' || viewParam === 'weekly') {
            setViewMode(viewParam);
        }
    }, [viewParam]);

    // Week Day Icons
    const dayIcons = useMemo(() => ({
        daily: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
        ),
        weekly: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
        ),
    }), []);

    return (
        <>
            {/* Hero Header */}
            <header className="mb-10 relative">
                <div className="flex flex-col items-center lg:flex-row lg:items-end lg:justify-between gap-6">
                    {/* Title Section */}
                    <div className="space-y-2 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <span className="text-4xl sm:text-5xl">📖</span>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                                Your Journal
                            </h1>
                        </div>
                        <p className="text-lg sm:text-xl text-gray-600 pl-1">
                            Every entry tells your story. Let&apos;s explore.
                        </p>
                    </div>

                    {/* Enhanced View Toggle */}
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={clsx(
                                "view-toggle-btn flex items-center gap-2",
                                viewMode === 'daily' && "active"
                            )}
                            aria-label="Switch to daily view"
                        >
                            {dayIcons.daily}
                            <span>Daily</span>
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={clsx(
                                "view-toggle-btn flex items-center gap-2",
                                viewMode === 'weekly' && "active"
                            )}
                            aria-label="Switch to weekly view"
                        >
                            {dayIcons.weekly}
                            <span>Weekly</span>
                        </button>
                    </div>
                </div>
            </header>

            <Suspense fallback={<SubmissionsSkeleton />}>
                <SubmissionsClient viewMode={viewMode} />
            </Suspense>
        </>
    );
}

export default function SubmissionsPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
            <SubmissionsContent />
        </div>
    );
}
