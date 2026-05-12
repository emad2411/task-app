"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleTaskCompletionAction } from "@/lib/actions/task";
import { toast } from "sonner";
import {
  formatRelativeDate,
  isDueToday,
  isOverdue,
} from "@/lib/utils/date";
import type { TaskPriority, TaskStatus } from "@/lib/db/schema";

interface UpcomingTasksProps {
  tasks: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    category: {
      name: string;
      color: string | null;
    } | null;
  }>;
  timezone?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Med", variant: "secondary" },
  low: { label: "Low", variant: "outline" },
};

export function UpcomingTasks({ tasks, timezone = "UTC" }: UpcomingTasksProps) {
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handleComplete(taskId: string) {
    setCompletingIds((prev) => new Set(prev).add(taskId));

    startTransition(async () => {
      const result = await toggleTaskCompletionAction(taskId);
      if (result.error) {
        toast.error(result.error);
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      } else {
        toast.success("Task completed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">
        Upcoming Tasks
      </h2>

      {tasks.length > 0 ? (
        <>
          <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            {tasks.map((task, index) => {
              const taskIsDueToday = isDueToday(task.dueDate, timezone);
              const taskIsOverdue = isOverdue(task.dueDate, timezone);
              const formattedDate = formatRelativeDate(task.dueDate, timezone);
              const priority = priorityConfig[task.priority];
              const isCompleting = completingIds.has(task.id);
              const isLast = index === tasks.length - 1;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 transition-colors",
                    "hover:bg-muted/50",
                    !isLast && "border-b border-border/60",
                    isCompleting && "opacity-50"
                  )}
              >
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={isCompleting || isPending}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    "border-border hover:border-brand hover:bg-brand/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isCompleting && "border-brand bg-brand"
                  )}
                  aria-label={`Complete ${task.title}`}
                >
                  {isCompleting && (
                    <Check className="h-3 w-3 text-background" />
                  )}
                </button>

                <Link
                  href={`/tasks/${task.id}`}
                  className="min-w-0 flex-1"
                >
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      isCompleting && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </span>
                </Link>

                {task.category ? (
                  <div className="hidden w-[100px] shrink-0 sm:flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: task.category.color || "#6b7280",
                      }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {task.category.name}
                    </span>
                  </div>
                ) : (
                  <div className="hidden w-[100px] shrink-0 sm:block" />
                )}

                <div className="w-[40px] shrink-0 flex justify-center">
                  <Badge
                    variant={priority.variant}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {priority.label}
                  </Badge>
                </div>

                <span
                  className={cn(
                    "w-[70px] shrink-0 text-right text-xs tabular-nums",
                    taskIsOverdue && "font-medium text-red-400",
                    taskIsDueToday && "font-medium text-amber-400",
                    !taskIsOverdue && !taskIsDueToday && "text-muted-foreground"
                  )}
                >
                  {formattedDate}
                </span>
              </div>
            );
          })}
        </div>

        <Link
          href="/tasks"
          className="block pt-3 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all tasks
        </Link>
        </>
      ) : (
        <div className="flex h-[140px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Nothing due this week
          </p>
          <p className="text-xs text-muted-foreground">
            You&apos;re ahead of schedule.
          </p>
        </div>
      )}
    </div>
  );
}
