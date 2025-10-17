import { Suspense } from 'react';
import JournalClient from './JournalClient';

function JournalLoading() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
            <div className="space-y-6">
                {/* Header Skeleton */}
                <header>
                    <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </header>

                {/* Main Card Skeleton */}
                <div className="border-2 border-gray-200 rounded-lg p-4 space-y-6">
                    {/* Your Thoughts Section */}
                    <div className="space-y-4">
                        <div className="flex items-center text-center">
                            <div className="flex-grow border-t-2 border-gray-200"></div>
                            <div className="flex-shrink mx-4 h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="flex-grow border-t-2 border-gray-200"></div>
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Your Ratings Section */}
                    <div className="space-y-6">
                        <div className="flex items-center text-center">
                            <div className="flex-grow border-t-2 border-gray-200"></div>
                            <div className="flex-shrink mx-4 h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="flex-grow border-t-2 border-gray-200"></div>
                        </div>

                        {/* Alignment Rating Skeleton */}
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="flex w-full gap-1">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="h-10 flex-1 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>

                        {/* Contentment Rating Skeleton */}
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="flex w-full gap-1">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="h-10 flex-1 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons Skeleton */}
                <div className="flex gap-4">
                    <div className="h-12 w-32 bg-gray-200 rounded"></div>
                    <div className="h-12 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );
}

export default function JournalPage() {
    return (
        <Suspense fallback={<JournalLoading />}>
            <JournalClient />
        </Suspense>
    );
}
