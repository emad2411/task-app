"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { toggleTaskCompletionAction } from "@/lib/actions/task";
import { TaskPriority, TaskStatus } from "@/lib/db/schema";
import { formatRelativeDate, isDueToday, isOverdue } from "@/lib/utils/date";

interface TaskRowProps {
  task: {
    id: string;
    title: string;
    dueDate: Date | null;
    createdAt: Date;
    priority: TaskPriority;
    status: TaskStatus;
    category: {
      name: string;
      color: string | null;
    } | null;
  };
  timezone?: string;
}

export function TaskRow({ task, timezone = "UTC" }: TaskRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  function handleRowClick() {
    router.push(`/tasks/${task.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick();
    }
  }

  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors cursor-pointer",
        "hover:bg-muted/50",
        done && "opacity-50",
        taskIsDueToday && !done && "bg-primary/5",
        taskIsOverdue && !done && "bg-destructive/5"
      )}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-label={`Task: ${task.title}`}
    >
      <td className="p-2 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={done}
          onCheckedChange={handleToggle}
          disabled={isPending}
          aria-label={`Mark "${task.title}" as ${done ? "incomplete" : "complete"}`}
          className="shrink-0"
        />
      </td>
      <td className="p-2 align-middle">
        <div className="min-w-0">
          <span
            className={cn(
              "font-medium block truncate",
              done && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>
          {/* Mobile: show status + priority inline */}
          <div className="flex items-center gap-2 mt-0.5 md:hidden">
            <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0" />
            <PriorityBadge priority={task.priority} className="text-[10px] px-1.5 py-0" />
          </div>
        </div>
      </td>
      <td className="p-2 align-middle hidden md:table-cell">
        <StatusBadge status={task.status} />
      </td>
      <td className="p-2 align-middle hidden md:table-cell">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="p-2 align-middle hidden lg:table-cell">
        {task.category ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: task.category.color || "#6b7280" }}
            />
            <span className="truncate">{task.category.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/50">&mdash;</span>
        )}
      </td>
      <td className="p-2 align-middle text-muted-foreground">
        {task.dueDate ? (
          <span
            className={cn(
              "text-xs md:text-sm",
              taskIsOverdue && !done && "font-medium text-destructive",
              taskIsDueToday && !done && "font-medium text-primary"
            )}
          >
            {formatRelativeDate(task.dueDate, timezone)}
          </span>
        ) : (
          <span className="text-muted-foreground/50">&mdash;</span>
        )}
      </td>
      <td className="p-2 align-middle text-muted-foreground hidden lg:table-cell">
        {formatRelativeDate(task.createdAt, timezone)}
      </td>
    </tr>
  );
}
