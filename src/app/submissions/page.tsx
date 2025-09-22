import { Suspense } from 'react';
import SubmissionsClient from './_components/SubmissionsClient'; // We will create this next
import { apiFetch } from "@/lib/api";
import { getStartOfWeek, formatDateForAPI } from "@/lib/dateUtils";
import { getGuestEntries } from "@/lib/guest"; // Assuming isGuestUser can be determined on server if needed, otherwise we pass it down

// A simple skeleton component for the fallback
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

// Helper to fetch initial data on the server
async function getInitialEntries(weekStart: Date) {
    // NOTE: In a real app, you'd determine if the user is a guest based on auth state (e.g., cookies)
    const isGuest = true; // For this example, assuming guest or fetching logic is server-compatible

    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const startDateStr = formatDateForAPI(weekStart);
    const endDateStr = formatDateForAPI(endDate);
    
    try {
        if (isGuest) {
            return getGuestEntries().filter(entry => {
                const entryDate = entry.createdAt.split('T')[0];
                return entryDate >= startDateStr && entryDate <= endDateStr;
            }).map(entry => ({
                local_date: entry.createdAt.split('T')[0],
                topics: entry.topics,
                alignment_rating: entry.alignment_rating,
                contentment_rating: entry.contentment_rating,
                id: entry.id
            }));
        } else {
            const params = new URLSearchParams({ start_date: startDateStr, end_date: endDateStr });
            // This fetch now happens on the server!
            const res = await apiFetch(`/api/journal?${params.toString()}`); 
            return res.data;
        }
    } catch (error) {
        console.error("Failed to fetch initial entries:", error);
        return [];
    }
}


export default async function SubmissionsPage({ searchParams }: { searchParams: { highlighted?: string } }) {
    const initialWeekStart = getStartOfWeek(new Date());
    const initialEntries = await getInitialEntries(initialWeekStart);
    
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <header className="mb-8">
                <h1 className="text-4xl font-bold">Journal Submissions</h1>
                <p className="text-lg text-gray-600">Review your journal entries week by week.</p>
            </header>
            
            <Suspense fallback={<SubmissionsSkeleton />}>
                <SubmissionsClient 
                    initialWeekStart={initialWeekStart.toISOString()}
                    initialEntries={initialEntries}
                />
            </Suspense>
        </div>
    );
}
