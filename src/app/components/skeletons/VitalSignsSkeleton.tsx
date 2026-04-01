import { Skeleton } from "../ui/skeleton";
import { TableSkeleton } from "./TableSkeleton";

export function VitalSignsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28 bg-gray-200" />
          <Skeleton className="h-4 w-48 bg-gray-100" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-blue-100" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-100" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { bg: "bg-red-50" },
          { bg: "bg-orange-50" },
          { bg: "bg-yellow-50" },
          { bg: "bg-violet-50" },
        ].map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl p-3 sm:p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="w-4 h-4 rounded bg-gray-200" />
              <Skeleton className="h-3 w-20 bg-gray-200" />
            </div>
            <Skeleton className="h-6 w-16 bg-gray-300" />
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <TableSkeleton columns={11} rows={5} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20 bg-blue-100" />
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-3 w-24 bg-gray-100" />
              </div>
              <Skeleton className="h-3 w-20 bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { bg: "bg-red-50" },
                { bg: "bg-orange-50" },
                { bg: "bg-yellow-50" },
                { bg: "bg-violet-50" },
              ].map((card, j) => (
                <div key={j} className={`${card.bg} rounded-lg p-2`}>
                  <Skeleton className="h-2 w-16 bg-gray-200 mb-1" />
                  <Skeleton className="h-4 w-12 bg-gray-300" />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs border-t border-gray-50 pt-2">
              <Skeleton className="h-3 w-20 bg-gray-100" />
              <Skeleton className="h-3 w-20 bg-gray-100" />
              <Skeleton className="h-3 w-16 bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VitalSignsTrendSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 animate-pulse">
      <Skeleton className="h-5 w-56 mb-1 bg-gray-200" />
      <Skeleton className="h-4 w-32 mb-4 bg-gray-100" />
      <div className="h-[180px] flex items-end gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-center">
            <Skeleton 
              className="w-full bg-red-100 rounded-t" 
              style={{ height: `${40 + Math.random() * 40}%` }}
            />
            <Skeleton 
              className="w-full bg-blue-100 rounded-t" 
              style={{ height: `${20 + Math.random() * 30}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8 bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
