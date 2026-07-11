import { Skeleton } from "@/components/ui/skeleton";
import { ListPageSkeleton } from "@/components/ui/list-skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FinanceiroLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-28" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <ListPageSkeleton columns={6} showHeader={false} />
    </div>
  );
}
