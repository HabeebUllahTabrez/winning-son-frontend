// src/app/profile/_components/ProfileSkeleton.tsx

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="space-y-10">
        <header className="flex justify-between items-center">
          <div>
            <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-28"></div>
        </header>

        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gray-200"></div>
          </div>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="form-group">
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="form-group">
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            {/* Email Field */}
            <div className="form-group">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            {/* Goal Field */}
            <div className="form-group">
              <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            {/* Date Fields */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
