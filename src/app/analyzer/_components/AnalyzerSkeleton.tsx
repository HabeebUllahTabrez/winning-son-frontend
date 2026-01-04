// src/app/analyzer/_components/AnalyzerSkeleton.tsx

export function AnalyzerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <div className="h-12 sm:h-16 bg-gray-200 rounded-lg w-80 sm:w-96 mx-auto"></div>
            <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-64 sm:w-80 mx-auto"></div>
          </div>

          {/* Subtitle */}
          <div className="h-6 bg-gray-200 rounded w-full max-w-2xl mx-auto mt-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 max-w-xl mx-auto mt-2"></div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="px-4 py-2 rounded-full bg-white border border-purple-200 shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Goal & Date Selection Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border-2 border-gray-200 shadow-lg shadow-purple-100/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-80"></div>

            {/* Goal Input */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          </div>

          {/* Analyzer Controls Card (placeholder for preferences) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg shadow-purple-100/50">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            
            {/* Toggle options */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                <div className="h-5 bg-gray-200 rounded w-36"></div>
              </div>
            </div>

            {/* Sliders */}
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded-full w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-28"></div>
                <div className="h-3 bg-gray-200 rounded-full w-full"></div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-14 sm:h-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl w-full sm:w-80"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
