import { Skeleton } from "../ui/skeleton";
import { TableSkeleton, MobileCardSkeleton } from "./TableSkeleton";

export function PatientsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24 bg-gray-200" />
          <Skeleton className="h-4 w-48 bg-gray-100" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg bg-blue-100" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center animate-pulse">
        <Skeleton className="h-10 flex-1 min-w-[200px] rounded-lg bg-gray-100" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-10 w-32 rounded-lg bg-gray-100" />
          <Skeleton className="h-10 w-28 rounded-lg bg-gray-100" />
          <Skeleton className="h-10 w-24 rounded-lg bg-gray-100" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <TableSkeleton columns={9} rows={6} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <MobileCardSkeleton count={4} />
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
        <Skeleton className="h-4 w-40 bg-gray-100" />
        <div className="flex items-center gap-1">
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
          <Skeleton className="w-8 h-8 rounded-lg bg-blue-100" />
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
          <Skeleton className="w-8 h-8 rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
