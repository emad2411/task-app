import { Skeleton } from "@/components/ui/skeleton";

export function CategorySkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
      <Skeleton className="h-4 flex-1 max-w-32" />
      <Skeleton className="h-4 w-8 shrink-0" />
      <Skeleton className="h-8 w-8 shrink-0" />
      <Skeleton className="h-8 w-8 shrink-0" />
    </div>
  );
}
