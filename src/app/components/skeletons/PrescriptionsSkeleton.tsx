import { Skeleton } from "../ui/skeleton";

export function PrescriptionsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 bg-gray-200" />
          <Skeleton className="h-4 w-72 bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full bg-blue-100" />
          <Skeleton className="h-8 w-28 rounded-full bg-emerald-100" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl bg-gray-100" />
          <Skeleton className="h-10 lg:w-56 rounded-xl bg-gray-100" />
          <Skeleton className="h-10 lg:w-28 rounded-xl bg-gray-100" />
        </div>
      </div>

      {/* Prescription Groups */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            {/* Group Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24 rounded-full bg-blue-100" />
                  <Skeleton className="h-5 w-40 bg-gray-200" />
                </div>
                <Skeleton className="h-3 w-28 bg-gray-100" />
              </div>
              <div className="space-y-1 sm:text-right">
                <Skeleton className="h-3 w-40 bg-gray-100" />
                <Skeleton className="h-3 w-32 bg-gray-100" />
              </div>
            </div>

            {/* Prescription Cards */}
            <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div key={cardIndex} className="border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl bg-blue-100" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 bg-gray-200" />
                        <Skeleton className="h-3 w-20 bg-gray-100" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6 rounded-lg bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-16 rounded-lg bg-gray-100" />
                      <Skeleton className="h-16 rounded-lg bg-gray-100" />
                    </div>
                    <Skeleton className="h-14 rounded-lg bg-gray-100" />
                    <Skeleton className="h-20 rounded-lg bg-blue-50" />
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
