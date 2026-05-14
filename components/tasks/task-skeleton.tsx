import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 h-10 px-2">
              <Skeleton className="h-4 w-4" />
            </th>
            <th className="h-10 px-2 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="h-10 px-2 text-left w-[120px] hidden md:table-cell">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="h-10 px-2 text-left w-[100px] hidden md:table-cell">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="h-10 px-2 text-left w-[140px] hidden lg:table-cell">
              <Skeleton className="h-4 w-18" />
            </th>
            <th className="h-10 px-2 text-left w-[100px]">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="h-10 px-2 text-left w-[120px] hidden lg:table-cell">
              <Skeleton className="h-4 w-14" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border/60">
              <td className="p-2">
                <Skeleton className="h-4 w-4" />
              </td>
              <td className="p-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20 md:hidden" />
                </div>
              </td>
              <td className="p-2 hidden md:table-cell">
                <Skeleton className="h-5 w-16" />
              </td>
              <td className="p-2 hidden md:table-cell">
                <Skeleton className="h-5 w-14" />
              </td>
              <td className="p-2 hidden lg:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="p-2">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-2 hidden lg:table-cell">
                <Skeleton className="h-4 w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
