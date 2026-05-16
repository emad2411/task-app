import { requireAuth } from "@/lib/auth/session";
import { getCategoriesWithTaskCount } from "@/lib/data/category";
import { CategoryList } from "@/components/categories/category-list";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import { CategoryEmptyState } from "@/components/categories/category-empty-state";
import { Button } from "@/components/ui/button";
import { Tags } from "lucide-react";

export default async function CategoriesPage() {
  const { user } = await requireAuth();

  if (!user) {
    return null;
  }

  const categories = await getCategoriesWithTaskCount(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <CreateCategoryDialog>
          <Button className="h-10 bg-brand text-background hover:bg-brand-deep">
            <Tags />
            New Category
          </Button>
        </CreateCategoryDialog>
      </div>

      {categories.length === 0 ? (
        <CategoryEmptyState />
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  );
}
