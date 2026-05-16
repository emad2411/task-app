"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    color: string | null;
  };
  taskCount: number;
}

export function CategoryItem({ category, taskCount }: CategoryItemProps) {
  const dotColor = category.color || "#6B7280";

  return (
    <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-6">
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />

      <Link
        href={`/tasks?category=${category.id}`}
        className="min-w-0 flex-1 text-sm font-medium text-foreground transition-colors hover:text-primary truncate"
      >
        {category.name}
      </Link>

      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        {taskCount}
      </span>

      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100",
          "transition-opacity duration-150 ease-out"
        )}
      >
        <EditCategoryDialog category={category}>
          <Button variant="ghost" size="icon-sm" className="h-10 w-10 md:h-8 md:w-8">
            <span className="sr-only">Edit {category.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </Button>
        </EditCategoryDialog>

        <DeleteCategoryDialog category={category} taskCount={taskCount}>
          <Button variant="ghost" size="icon-sm" className="h-10 w-10 md:h-8 md:w-8">
            <span className="sr-only">Delete {category.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </DeleteCategoryDialog>
      </div>
    </div>
  );
}
