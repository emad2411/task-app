"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Archive, Trash2, Pencil, Circle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { ArchiveTaskDialog } from "./archive-task-dialog";
import { toggleTaskCompletionAction } from "@/lib/actions/task";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";
import type { Category } from "@/lib/db/schema";
import { formatDate, isDueToday, isOverdue } from "@/lib/utils/date";

interface TaskDetailViewProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: {
      name: string;
      color: string | null;
    } | null;
    categoryId: string | null;
  };
  categories: Category[];
  timezone?: string;
}

const statusConfig: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  todo: { label: "To Do", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  done: { label: "Done", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

const priorityConfig: Record<TaskPriority, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "secondary" },
  low: { label: "Low", variant: "default" },
};

export function TaskDetailView({ task, categories, timezone = "UTC" }: TaskDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const done = task.status === "done";
  const taskIsDueToday = isDueToday(task.dueDate, timezone);
  const taskIsOverdue = isOverdue(task.dueDate, timezone);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleTaskCompletionAction(task.id);

      if (result.success) {
        toast.success(done ? "Task reopened" : "Task completed");
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h1 className={cn("text-2xl font-bold tracking-tight", done && "line-through opacity-60")}>
          {task.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant={priority.variant}>{priority.label}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {task.dueDate && (
            <div className={cn(
              taskIsOverdue && "text-destructive font-medium",
              taskIsDueToday && "text-primary font-medium"
            )}>
              Due: {formatDate(task.dueDate, "MMM dd, yyyy", timezone)}
              {taskIsDueToday && " (Today)"}
              {taskIsOverdue && " (Overdue)"}
            </div>
          )}
          {task.category && (
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: task.category.color || "#6b7280" }}
              />
              {task.category.name}
            </div>
          )}
          <div>Created: {formatDate(task.createdAt, "MMM dd, yyyy", timezone)}</div>
          <div>Updated: {formatDate(task.updatedAt, "MMM dd, yyyy", timezone)}</div>
          {task.completedAt && (
            <div>Completed: {formatDate(task.completedAt, "MMM dd, yyyy", timezone)}</div>
          )}
        </div>

        {task.description && (
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {task.description}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            variant={done ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
          >
            {done ? (
              <>
                <Circle className="mr-2 h-4 w-4" />
                Reopen
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Complete
              </>
            )}
          </Button>

          <EditTaskDialog
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              categoryId: task.categoryId,
            }}
            categories={categories}
          >
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </EditTaskDialog>

          {task.status !== "archived" && (
            <ArchiveTaskDialog taskId={task.id}>
              <Button variant="outline" size="sm">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </ArchiveTaskDialog>
          )}

          <DeleteTaskDialog
            taskId={task.id}
            taskTitle={task.title}
            onDeleted={() => router.push("/tasks")}
          >
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DeleteTaskDialog>
        </div>
      </div>
    </div>
  );
}
