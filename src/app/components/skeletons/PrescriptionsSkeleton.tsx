import { Skeleton } from "../ui/skeleton";

export function PrescriptionsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-64 bg-gray-100" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 animate-pulse">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-100" />
      </div>

      {/* Prescription Groups */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            {/* Group Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-5 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-24 bg-blue-100" />
                <Skeleton className="h-4 w-32 bg-gray-200" />
              </div>
              <Skeleton className="h-3 w-48 bg-gray-100" />
            </div>
            
            {/* Prescription Cards */}
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 2 }).map((_, cardIndex) => (
                <div key={cardIndex} className="border border-gray-100 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-lg bg-violet-100" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 bg-gray-200" />
                        <Skeleton className="h-3 w-16 bg-gray-100" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6 rounded-lg bg-gray-100" />
                  </div>
                  <div className="space-y-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-3 w-16 bg-gray-100" />
                        <Skeleton className="h-3 w-20 bg-gray-200" />
                      </div>
                    ))}
                    <div className="pt-1 border-t border-gray-50 mt-1">
                      <Skeleton className="h-3 w-full bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
