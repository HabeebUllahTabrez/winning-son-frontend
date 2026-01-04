// src/app/dashboard/_components/DashboardSkeleton.tsx

export function DashboardSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 animate-pulse">
            <div className="space-y-8 md:space-y-12">
                {/* Header with Avatar */}
                <header className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-gray-300"></div>
                    <div>
                        <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                    </div>
                </header>

                {/* Call to Action Skeleton */}
                <div className="h-24 bg-gray-200 rounded-lg"></div>

                {/* This Week Section */}
                <section className="space-y-4 md:space-y-6">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                    </div>

                    {/* Stat Cards Grid - 2x2 on mobile, 4 on desktop */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card p-3 md:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                </div>
                                <div className="h-8 md:h-10 bg-gray-200 rounded w-24 mb-1"></div>
                            </div>
                        ))}
                    </div>

                    {/* 7-Day Trend Chart Skeleton */}
                    <div className="card p-6">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-72 bg-gray-200 rounded"></div>
                    </div>
                </section>

                {/* Overall Stats Section */}
                <section className="space-y-4 md:space-y-6">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-36 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-56"></div>
                    </div>

                    {/* Stat Cards Grid - 2x2 on mobile, 4 on desktop */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card p-3 md:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                </div>
                                <div className="h-8 md:h-10 bg-gray-200 rounded w-20 mb-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                        ))}
                    </div>

                    {/* Activity Calendar Skeleton */}
                    <div className="card p-6">
                        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </section>

                {/* Quick Actions Skeleton */}
                <section className="card p-4 md:p-6">
                    <div className="h-7 bg-gray-200 rounded w-36 mb-4"></div>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                        ))}
                        <div className="col-span-2 h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                </section>
            </div>
        </div>
    );
}
