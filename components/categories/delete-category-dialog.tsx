"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCategoryAction } from "@/lib/actions/category";

interface DeleteCategoryDialogProps {
  category: {
    id: string;
    name: string;
  };
  taskCount: number;
  children?: React.ReactNode;
}

export function DeleteCategoryDialog({
  category,
  taskCount,
  children,
}: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);

      if (result.success) {
        toast.success("Category deleted");
        setOpen(false);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon-sm">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete {category.name}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{category.name}&rdquo;?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {taskCount > 0 && (
            <p className="text-sm text-destructive">
              {taskCount} task{taskCount !== 1 ? "s" : ""} will become uncategorized.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
