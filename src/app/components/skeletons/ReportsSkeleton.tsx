import { Skeleton } from "../ui/skeleton";
import { StatCardSkeleton, ChartSkeleton, PieChartSkeleton } from "./CardSkeleton";

export function ReportsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg bg-gray-100" />
          <Skeleton className="h-10 w-24 rounded-lg bg-blue-100" />
        </div>
      </div>

      {/* Key Metrics */}
      <StatCardSkeleton count={4} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <ChartSkeleton height={180} />
        </div>
        <PieChartSkeleton />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <ChartSkeleton height={180} />
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 animate-pulse">
          <Skeleton className="h-5 w-40 mb-4 bg-gray-200" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Skeleton className="w-28 h-28 rounded-full bg-gray-200" />
            <div className="flex sm:flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12 bg-gray-100" />
                    <Skeleton className="h-5 w-10 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center bg-gray-50 rounded-lg p-2">
                <Skeleton className="h-5 w-10 mx-auto bg-gray-200" />
                <Skeleton className="h-2 w-12 mx-auto mt-1 bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Downloads */}
      <div>
        <Skeleton className="h-5 w-48 mb-4 bg-gray-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl bg-gray-200" />
                <Skeleton className="h-4 w-16 bg-gray-100" />
              </div>
              <Skeleton className="h-4 w-32 mb-1 bg-gray-200" />
              <Skeleton className="h-3 w-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
