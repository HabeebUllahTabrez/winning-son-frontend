// src/app/profile/_components/ProfileSkeleton.tsx

export function ProfileSkeleton() {
  return (
    <div className="min-h-[calc(100vh-150px)] p-4 md:p-6 pt-16 md:pt-20">
      <div className="max-w-2xl mx-auto animate-pulse">
        {/* Single Profile Card */}
        <div className="card p-6">
          {/* Avatar - Centered at top */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 border-4 border-black shadow-lg"></div>
          </div>

          {/* Name and Email */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          </div>

          {/* UNIFIED CONTENT */}
          <div className="space-y-6">
            {/* Profile Details Section */}
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
              <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-3 pl-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goal Section */}
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 pt-3 border-t border-dashed space-y-2 sm:space-y-0">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Support & Resources Section */}
          <div className="mt-8">
            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 shadow-[2px_2px_0_0_#e5e7eb]">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons at bottom of card */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row gap-3 w-full">
            <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
