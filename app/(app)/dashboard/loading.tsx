import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>

      {/* Content Grid: Priority Summary + Upcoming Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Priority Summary */}
        <Skeleton className="h-48 rounded-xl" />

        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
