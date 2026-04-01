import { Skeleton } from "../ui/skeleton";
import { TableSkeleton, MobileCardSkeleton } from "./TableSkeleton";

export function AppointmentsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg bg-gray-200" />
          <Skeleton className="h-10 w-28 rounded-lg bg-blue-100" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 animate-pulse">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-28 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-100" />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <TableSkeleton columns={8} rows={5} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <MobileCardSkeleton count={4} />
      </div>
    </div>
  );
}

export function AppointmentsCalendarSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg bg-gray-200" />
          <Skeleton className="h-10 w-28 rounded-lg bg-blue-100" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 animate-pulse">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-28 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-100" />
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-28 bg-gray-200" />
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
            <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
          </div>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border border-gray-100">
              <Skeleton className="h-4 w-4 mb-1 bg-gray-100" />
              {i % 7 === 0 && <Skeleton className="h-3 w-full mt-1 bg-blue-50 rounded" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
