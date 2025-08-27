// src/app/dashboard/_components/DashboardSkeleton.tsx

export function DashboardSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
            <div className="space-y-12">
                <header>
                    <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </header>

                {/* Call to Action Skeleton */}
                <div className="h-24 bg-gray-200 rounded-lg"></div>

                {/* Stat Cards Skeleton */}
                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                </section>

                {/* Chart Skeleton */}
                <section className="h-80 bg-gray-200 rounded-lg"></section>
                
                {/* More Stats Skeleton */}
                <section>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                </section>
            </div>
        </div>
    );
}
