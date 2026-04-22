import { CategorySkeleton } from "@/components/categories/category-skeleton";

export default function CategoriesLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-md bg-muted" />
            <div className="h-4 w-20 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        <div className="flex flex-col gap-2">
          <CategorySkeleton />
          <CategorySkeleton />
          <CategorySkeleton />
        </div>
      </main>
    </div>
  );
}