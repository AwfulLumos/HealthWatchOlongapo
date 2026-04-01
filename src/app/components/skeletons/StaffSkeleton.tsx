import { Skeleton } from "../ui/skeleton";

export function StaffSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg bg-blue-100" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 animate-pulse">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-28 rounded-lg bg-gray-100" />
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl bg-blue-100" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-gray-200" />
                  <Skeleton className="h-4 w-16 rounded-full bg-gray-200" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full bg-green-100" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Skeleton className="h-3 w-14 bg-gray-100" />
                <Skeleton className="h-3 w-24 bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-3 w-14 bg-gray-100" />
                <Skeleton className="h-3 w-28 bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-3 w-14 bg-gray-100" />
                <Skeleton className="h-3 w-24 bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-3 w-14 bg-gray-100" />
                <Skeleton className="h-3 w-36 bg-gray-200" />
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-50 pt-3">
              <Skeleton className="h-8 flex-1 rounded-lg bg-gray-100" />
              <Skeleton className="h-8 flex-1 rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
