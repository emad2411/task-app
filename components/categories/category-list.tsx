import type { CategoryWithTaskCount } from "@/lib/data/category";
import { CategoryItem } from "./category-item";

interface CategoryListProps {
  categories: CategoryWithTaskCount[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          taskCount={category.taskCount}
        />
      ))}
    </div>
  );
}
