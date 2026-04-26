"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTaskCompletionAction } from "@/lib/actions/task";
import { TaskPriority, TaskStatus } from "@/lib/db/schema";
import { formatRelativeDate, isDueToday, isOverdue } from "@/lib/utils/date";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    dueDate: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    category: {
      name: string;
      color: string | null;
    } | null;
  };
  timezone?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "secondary" },
  low: { label: "Low", variant: "default" },
};

export function TaskItem({ task, timezone = "UTC" }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();
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
    <div
      className={cn(
        "group flex items-start sm:items-center gap-3 rounded-lg border p-3 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        done && "opacity-60",
        taskIsDueToday && "border-primary/50 bg-primary/5",
        taskIsOverdue && "border-destructive/50 bg-destructive/5"
      )}
    >
      {/* Checkbox with enlarged tap area on mobile */}
      <label className="flex items-center justify-center shrink-0 h-11 w-11 -ml-2 cursor-pointer">
        <Checkbox
          checked={done}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={done ? "Mark as incomplete" : "Mark as complete"}
          className="shrink-0"
        />
      </label>

      <Link
        href={`/tasks/${task.id}`}
        className="min-w-0 flex-1 space-y-1 py-0.5"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate font-medium text-base",
              done && "line-through"
            )}
          >
            {task.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {task.category && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: task.category.color || "#6b7280" }}
              />
              {task.category.name}
            </span>
          )}
          <Badge variant={priority.variant} className="text-xs sm:hidden">
            {priority.label}
          </Badge>
          {task.dueDate && (
            <span
              className={cn(
                "text-sm",
                taskIsOverdue && "font-medium text-destructive",
                taskIsDueToday && "font-medium text-primary"
              )}
            >
              {formatRelativeDate(task.dueDate, timezone)}
            </span>
          )}
        </div>
      </Link>

      <div className="hidden sm:flex shrink-0 items-center gap-2">
        <Badge variant={priority.variant} className="text-xs">
          {priority.label}
        </Badge>

        {task.dueDate && (
          <span
            className={cn(
              "text-sm",
              taskIsOverdue && "font-medium text-destructive",
              taskIsDueToday && "font-medium text-primary"
            )}
          >
            {formatRelativeDate(task.dueDate, timezone)}
          </span>
        )}
      </div>
    </div>
  );
}
