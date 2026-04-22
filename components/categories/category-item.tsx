"use client";

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
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent sm:p-4",
        "flex-col gap-2 sm:flex-row sm:gap-0"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-sm font-medium">{category.name}</span>
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <span className="text-sm text-muted-foreground">
          {taskCount} task{taskCount !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-1">
          <EditCategoryDialog category={category}>
            <Button variant="ghost" size="sm">
              <span className="sr-only">Edit</span>
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
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </Button>
          </EditCategoryDialog>
          <DeleteCategoryDialog category={category} taskCount={taskCount}>
            <Button variant="ghost" size="sm">
              <span className="sr-only">Delete</span>
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
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </DeleteCategoryDialog>
        </div>
      </div>
    </div>
  );
}