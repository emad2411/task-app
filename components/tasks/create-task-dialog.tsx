"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { createTaskAction } from "@/lib/actions/task";
import { useCategories } from "@/lib/context/categories-context";

interface CreateTaskDialogProps {
  children?: React.ReactNode;
}

export function CreateTaskDialog({ children }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const categories = useCategories();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your list.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          categories={categories}
          onSubmit={createTaskAction}
          onSuccess={() => setOpen(false)}
          submitLabel="Create Task"
        />
      </DialogContent>
    </Dialog>
  );
}
