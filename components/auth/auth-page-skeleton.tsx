import { Skeleton } from "@/components/ui/skeleton";

export function AuthPageSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">TaskFlow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Task Management
        </p>
      </div>
      <div className="w-full space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <Skeleton className="mx-auto h-6 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
