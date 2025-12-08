'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import SubmissionsClient from './_components/SubmissionsClient';
import clsx from 'clsx';

type ViewMode = 'daily' | 'weekly';

// Icons
const CalendarDayIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
);

const CalendarWeekIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

// A simple loading skeleton for the Suspense fallback
function SubmissionsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Navigation Card Skeleton */}
            <div className="card mb-8 p-4">
                <div className="flex justify-between items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <div className="h-7 bg-gray-200 rounded w-48 sm:w-64"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            {/* Weekly View Structure */}
            <div className="space-y-8">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div key={dayIndex}>
                        {/* Day Header */}
                        <div className="flex items-center gap-2 border-b-2 border-black/10 pb-2 mb-4">
                            <div className="h-7 bg-gray-200 rounded w-24"></div>
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                        </div>
                        
                        {/* Entry Card or Empty State */}
                        {dayIndex % 2 === 0 ? (
                            // Entry Card Skeleton
                            <div className="card">
                                <div className="flex flex-wrap justify-between items-start gap-2 border-b-2 border-black/10 pb-3 mb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="h-7 bg-purple-100 rounded-full w-28"></div>
                                        <div className="h-7 bg-yellow-100 rounded-full w-32"></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                                    <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ) : (
                            // Empty State Skeleton
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                                <div className="h-5 bg-gray-200 rounded w-40 mx-auto mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubmissionsContent() {
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleViewChange = (mode: ViewMode) => {
        setViewMode(mode);
        setIsDropdownOpen(false);
    };

    return (
        <>
            <header className="mb-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">Journal Submissions</h1>
                        <p className="text-base sm:text-lg text-gray-600 hidden sm:block">Review your journal entries.</p>
                    </div>

                    {/* Mobile: Custom Dropdown */}
                    <div className="sm:hidden relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black bg-white font-bold text-sm"
                        >
                            {viewMode === 'daily' ? <CalendarDayIcon /> : <CalendarWeekIcon />}
                            <span className="capitalize">{viewMode}</span>
                            <ChevronDownIcon />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] overflow-hidden z-50">
                                <button
                                    onClick={() => handleViewChange('daily')}
                                    className={clsx(
                                        "flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100",
                                        viewMode === 'daily' && "bg-gray-50"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <CalendarDayIcon />
                                        Daily
                                    </span>
                                    {viewMode === 'daily' && (
                                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleViewChange('weekly')}
                                    className={clsx(
                                        "flex items-center justify-between w-full px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-gray-100",
                                        viewMode === 'weekly' && "bg-gray-50"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <CalendarWeekIcon />
                                        Weekly
                                    </span>
                                    {viewMode === 'weekly' && (
                                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Desktop: Full Toggle */}
                    <div className="hidden sm:inline-flex rounded-lg border-2 border-black bg-gray-50 p-1">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all text-sm",
                                viewMode === 'daily'
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            )}
                        >
                            <CalendarDayIcon />
                            Daily
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all text-sm",
                                viewMode === 'weekly'
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                            )}
                        >
                            <CalendarWeekIcon />
                            Weekly
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
        <div className="max-w-5xl mx-auto px-4 py-10">
            <SubmissionsContent />
        </div>
    );
}
