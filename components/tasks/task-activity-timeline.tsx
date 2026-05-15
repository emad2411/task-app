"use client";

import { cn } from "@/lib/utils";
import { Circle, CheckCircle2, Clock, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface ActivityEvent {
  id: string;
  type: "created" | "completed" | "updated" | "status_change";
  label: string;
  timestamp: Date;
  icon: React.ReactNode;
}

function deriveEvents(task: {
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  status: string;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [
    {
      id: "created",
      type: "created",
      label: "Task created",
      timestamp: task.createdAt,
      icon: <Circle className="size-3" />,
    },
  ];

  if (task.completedAt) {
    events.push({
      id: "completed",
      type: "completed",
      label: "Marked as done",
      timestamp: task.completedAt,
      icon: <CheckCircle2 className="size-3 text-brand" />,
    });
  }

  if (
    task.updatedAt.getTime() !== task.createdAt.getTime() &&
    (!task.completedAt ||
      task.updatedAt.getTime() !== task.completedAt.getTime())
  ) {
    events.push({
      id: "updated",
      type: "updated",
      label: "Task updated",
      timestamp: task.updatedAt,
      icon: <Pencil className="size-3 text-muted-foreground" />,
    });
  }

  return events.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

export function TaskActivityTimeline({
  task,
  timezone = "UTC",
  className,
}: {
  task: {
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    status: string;
  };
  timezone?: string;
  className?: string;
}) {
  const events = deriveEvents(task);

  return (
    <div className={cn("space-y-0.5", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Activity
      </h3>
      <div className="relative">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="relative flex items-start gap-3 pl-0.5">
              <div className="relative z-10 mt-0.5 flex size-[11px] items-center justify-center rounded-full bg-background">
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{event.label}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="size-3" />
                  {formatDate(event.timestamp, "MMM dd, yyyy 'at' h:mm a", timezone)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
