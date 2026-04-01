import { Skeleton } from "../ui/skeleton";

interface StatCardSkeletonProps {
  count?: number;
}

export function StatCardSkeleton({ count = 4 }: StatCardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20 bg-gray-100" />
              <Skeleton className="h-6 w-16 bg-gray-200" />
              <Skeleton className="h-3 w-24 bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 animate-pulse">
      <Skeleton className="h-5 w-40 mb-4 bg-gray-200" />
      <div className="flex items-end gap-2 justify-between" style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 bg-gray-100 rounded-t-md" 
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-6 bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export function PieChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 animate-pulse">
      <Skeleton className="h-5 w-32 mb-4 bg-gray-200" />
      <div className="flex justify-center mb-4">
        <Skeleton className="w-28 h-28 rounded-full bg-gray-200" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full bg-gray-200" />
              <Skeleton className="h-3 w-20 bg-gray-100" />
            </div>
            <Skeleton className="h-3 w-8 bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40 bg-gray-200" />
        <Skeleton className="h-4 w-16 bg-gray-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-3 w-36 bg-gray-100" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
