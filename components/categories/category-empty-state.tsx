import { Tags } from "lucide-react";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { CreateCategoryDialog } from "./create-category-dialog";

export function CategoryEmptyState() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Tags className="size-4" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No categories yet</EmptyTitle>
        <EmptyDescription>
          Create your first category to organize your tasks.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateCategoryDialog />
      </EmptyContent>
    </Empty>
  );
}
