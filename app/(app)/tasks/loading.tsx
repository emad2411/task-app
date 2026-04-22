import { TaskSkeleton } from "@/components/tasks/task-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filter bar skeleton */}
        <div className="hidden flex-wrap items-center gap-3 sm:flex">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[140px]" />
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[130px]" />
        </div>

        {/* Mobile filter skeleton */}
        <div className="flex flex-col gap-2 sm:hidden">
          <Skeleton className="h-9 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>

        <TaskSkeleton />
      </main>
    </div>
  );
}
