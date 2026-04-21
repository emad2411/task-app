"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/lib/db/schema";

interface TaskCardProps {
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
  variant?: "compact" | "expanded";
  isDueToday?: boolean;
  isOverdue?: boolean;
  formattedDueDate?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  high: { label: "High", color: "bg-red-500", variant: "destructive" },
  medium: { label: "Medium", color: "bg-amber-500", variant: "secondary" },
  low: { label: "Low", color: "bg-blue-500", variant: "default" },
};

export function TaskCard({
  task,
  variant = "compact",
  isDueToday = false,
  isOverdue = false,
  formattedDueDate,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isDueToday && "border-primary/50 bg-primary/5",
        isOverdue && "border-destructive/50 bg-destructive/5"
      )}
    >
      {/* Category indicator */}
      {task.category && (
        <div
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: task.category.color || "#6b7280" }}
        />
      )}

      {/* Task info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{task.title}</span>
        </div>

        {variant === "expanded" && task.category && (
          <div className="text-sm text-muted-foreground">
            {task.category.name}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={priority.variant} className="text-xs">
          {priority.label}
        </Badge>

        {formattedDueDate && (
          <span
            className={cn(
              "text-sm",
              isOverdue && "font-medium text-destructive",
              isDueToday && "font-medium text-primary"
            )}
          >
            {formattedDueDate}
          </span>
        )}
      </div>
    </Link>
  );
}
