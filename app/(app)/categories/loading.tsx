import { CategorySkeleton } from "@/components/categories/category-skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-7 w-32 rounded-md bg-muted" />
          <div className="mt-1 h-4 w-20 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-muted" />
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        <CategorySkeleton />
        <CategorySkeleton />
        <CategorySkeleton />
        <CategorySkeleton />
        <CategorySkeleton />
      </div>
    </div>
  );
}
