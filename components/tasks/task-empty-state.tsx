import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Search className="mb-3 h-10 w-10 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No tasks match your filters</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or clearing your filters.
          </p>
          {onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-2">
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No tasks yet</h3>
        <p className="text-muted-foreground">
          Get started by creating your first task.
        </p>
        <CreateTaskDialog categories={categories} />
      </div>
    </div>
  );
}
