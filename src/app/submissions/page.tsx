import { Suspense } from 'react';
import SubmissionsClient from './_components/SubmissionsClient';

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

export default function SubmissionsPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <header className="mb-8">
                <h1 className="text-4xl font-bold">Journal Submissions</h1>
                <p className="text-lg text-gray-600">Review your journal entries week by week.</p>
            </header>

            {/* Suspense is required because SubmissionsClient uses useSearchParams() */}
            <Suspense fallback={<SubmissionsSkeleton />}>
                <SubmissionsClient />
            </Suspense>
        </div>
    );
}
