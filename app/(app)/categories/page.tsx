import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getCategoriesWithTaskCount } from "@/lib/data/category";
import { CategoryList } from "@/components/categories/category-list";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import { Tags } from "lucide-react";

export default async function CategoriesPage() {
  await connection();
  const { user } = await requireAuth();

  if (!user) {
    return null;
  }

  const categories = await getCategoriesWithTaskCount(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <CreateCategoryDialog>
            <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground [a]:hover:bg-primary/80 px-4 py-2 gap-2">
              <Tags className="mr-2 h-4 w-4" />
              New Category
            </button>
          </CreateCategoryDialog>
        </div>

        {categories.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Tags className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No categories yet</h2>
              <p className="text-muted-foreground max-w-md">
                Create your first category to organize your tasks.
              </p>
            </div>
            <CreateCategoryDialog>
              <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground [a]:hover:bg-primary/80 px-4 py-2 gap-2">
                <Tags className="mr-2 h-4 w-4" />
                Create Your First Category
              </button>
            </CreateCategoryDialog>
          </div>
        ) : (
          <CategoryList categories={categories} />
        )}
      </main>
    </div>
  );
}