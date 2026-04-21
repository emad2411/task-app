import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskPriority, TaskStatus } from "@/lib/db/schema";
import {
  formatRelativeDate,
  isDueToday,
  isOverdue,
} from "@/lib/utils/date";

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

export function UpcomingTasks({ tasks, timezone = "UTC" }: UpcomingTasksProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length > 0 ? (
          <>
            <div className="space-y-2">
              {tasks.map((task) => {
                const taskIsDueToday = isDueToday(task.dueDate, timezone);
                const taskIsOverdue = isOverdue(task.dueDate, timezone);
                const formattedDate = formatRelativeDate(task.dueDate, timezone);

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="compact"
                    isDueToday={taskIsDueToday}
                    isOverdue={taskIsOverdue}
                    formattedDueDate={formattedDate}
                  />
                );
              })}
            </div>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/tasks">
                View all tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No tasks due in the next 7 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
