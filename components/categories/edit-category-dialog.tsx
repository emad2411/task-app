"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { updateCategoryAction } from "@/lib/actions/category";

interface EditCategoryDialogProps {
  category: {
    id: string;
    name: string;
    color: string | null;
  };
  children?: React.ReactNode;
}

export function EditCategoryDialog({
  category,
  children,
}: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Rename or change the color of this category.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={async (data) => updateCategoryAction({ ...data, id: category.id })}
          onSuccess={() => setOpen(false)}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}