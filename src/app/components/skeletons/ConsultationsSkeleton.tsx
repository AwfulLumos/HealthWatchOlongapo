import { Skeleton } from "../ui/skeleton";
import { TableSkeleton, MobileCardSkeleton } from "./TableSkeleton";

export function ConsultationsSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-52 bg-gray-100" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg bg-blue-100" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 animate-pulse">
        <Skeleton className="h-10 flex-1 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-28 rounded-lg bg-gray-100" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-100" />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <TableSkeleton columns={9} rows={5} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <MobileCardSkeleton count={4} />
      </div>
    </div>
  );
}
