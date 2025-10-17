// src/app/analyzer/_components/AnalyzerSkeleton.tsx

export function AnalyzerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-10 animate-pulse">
        <div className="h-12 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-80 mx-auto"></div>
      </header>

      <div className="card p-8 space-y-6 animate-pulse">
        {/* Title */}
        <div className="h-8 bg-gray-200 rounded w-64"></div>

        {/* Goal Input */}
        <div className="form-group">
          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="form-group">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        {/* Checkboxes Section */}
        <div className="form-group">
          <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="h-12 bg-gray-200 rounded w-full sm:w-64"></div>
      </div>
    </div>
  );
}
