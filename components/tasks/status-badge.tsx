import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/db/schema";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  todo: {
    label: "To Do",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-brand/15 text-brand",
  },
  done: {
    label: "Done",
    className: "bg-primary/15 text-primary",
  },
  archived: {
    label: "Archived",
    className: "bg-muted/50 text-muted-foreground/70",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

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
