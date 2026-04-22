import type { CategoryWithTaskCount } from "@/lib/data/category";
import { CategoryItem } from "./category-item";

interface CategoryListProps {
  categories: CategoryWithTaskCount[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="flex flex-col gap-2">
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