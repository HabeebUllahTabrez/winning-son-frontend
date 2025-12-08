'use client';

import { Suspense, useState } from 'react';
import SubmissionsClient from './_components/SubmissionsClient';
import clsx from 'clsx';

type ViewMode = 'daily' | 'weekly';

// A simple loading skeleton for the Suspense fallback
function SubmissionsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="card h-16 mb-8"></div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="card h-24"></div>
                </div>
            ))}
        </div>
    );
}

function SubmissionsContent() {
    const [viewMode, setViewMode] = useState<ViewMode>('weekly');

    return (
        <>
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">Journal Submissions</h1>
                        <p className="text-base sm:text-lg text-gray-600">Review your journal entries.</p>
                    </div>

                    {/* View Toggle */}
                    <div className="inline-flex rounded-lg bg-gray-100 p-1 self-start sm:self-auto">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={clsx(
                                "px-4 py-2 rounded-md font-medium transition-all text-sm",
                                viewMode === 'daily'
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-600 hover:text-black"
                            )}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setViewMode('weekly')}
                            className={clsx(
                                "px-4 py-2 rounded-md font-medium transition-all text-sm",
                                viewMode === 'weekly'
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-600 hover:text-black"
                            )}
                        >
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
