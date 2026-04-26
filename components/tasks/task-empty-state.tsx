import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { CreateTaskDialog } from "./create-task-dialog";
import type { Category } from "@/lib/db/schema";

interface TaskEmptyStateProps {
  hasFilters: boolean;
  categories?: Category[];
  onClearFilters?: () => void;
}

export function TaskEmptyState({
  hasFilters,
  categories = [],
  onClearFilters,
}: TaskEmptyStateProps) {
  if (hasFilters) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Search className="size-4" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No tasks match your filters</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search or clearing your filters.
          </EmptyDescription>
        </EmptyHeader>
        {onClearFilters && (
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyMedia variant="icon" />
      <EmptyHeader>
        <EmptyTitle>No tasks yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first task.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateTaskDialog categories={categories} />
      </EmptyContent>
    </Empty>
  );
}
