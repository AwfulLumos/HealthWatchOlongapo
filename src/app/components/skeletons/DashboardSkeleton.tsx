import { Skeleton } from "../ui/skeleton";
import { StatCardSkeleton, ChartSkeleton, PieChartSkeleton, ListCardSkeleton } from "./CardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full bg-gray-200" />
      </div>

      {/* Stats Cards */}
      <StatCardSkeleton count={4} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <ChartSkeleton height={180} />
        </div>
        <PieChartSkeleton />
      </div>

      {/* Monthly Trend */}
      <ChartSkeleton height={140} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <ListCardSkeleton count={4} />
        <ListCardSkeleton count={4} />
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 animate-pulse">
        <Skeleton className="h-5 w-32 mb-4 bg-gray-200" />
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg bg-yellow-50" />
          <Skeleton className="h-14 w-full rounded-lg bg-blue-50" />
        </div>
      </div>
    </div>
  );
}
