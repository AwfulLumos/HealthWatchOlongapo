import { Skeleton } from "../ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ columns = 6, rows = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {showHeader && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1 bg-gray-200" />
          ))}
        </div>
      )}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={`h-4 flex-1 bg-gray-100 ${colIndex === 0 ? "max-w-[80px]" : ""}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-200" />
                <Skeleton className="h-3 w-20 bg-gray-100" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-3 w-16 bg-gray-100" />
                <Skeleton className="h-3 w-20 bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-50">
            <Skeleton className="h-8 flex-1 rounded-lg bg-gray-100" />
            <Skeleton className="h-8 flex-1 rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
