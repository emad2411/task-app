import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/db/schema";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "bg-destructive/15 text-destructive",
  },
  medium: {
    label: "Medium",
    className: "bg-secondary text-secondary-foreground",
  },
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
