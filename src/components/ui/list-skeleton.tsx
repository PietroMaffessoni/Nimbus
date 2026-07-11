import { Skeleton } from "@/components/ui/skeleton";

export function ListPageSkeleton({
  columns = 4,
  rows = 6,
  showHeader = true,
}: {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-xs" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-4 rounded-2xl border border-border p-4">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
