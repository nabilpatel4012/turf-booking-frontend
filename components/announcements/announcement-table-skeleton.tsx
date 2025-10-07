import { Skeleton } from "@/components/ui/skeleton";

export function AnnouncementTableSkeleton() {
  return (
    <div className="border rounded-lg">
      {/* Table Headers */}
      <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50">
        <Skeleton className="h-4 col-span-2" />
        <Skeleton className="h-4 col-span-1" />
        <Skeleton className="h-4 col-span-1" />
        <Skeleton className="h-4 col-span-1" />
      </div>

      {/* Table Rows */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0"
        >
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
