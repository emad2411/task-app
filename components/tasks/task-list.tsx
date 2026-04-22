import { TaskItem } from "./task-item";
import { TaskGroupHeader } from "./task-group-header";
import { groupTasks } from "@/lib/utils/task-grouping";
import type { TaskStatus, TaskPriority } from "@/lib/db/schema";

interface TaskListTask {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: {
    name: string;
    color: string | null;
  } | null;
}

interface TaskListProps {
  tasks: TaskListTask[];
  timezone?: string;
  groupBy?: "none" | "status" | "category" | "dueDate";
}

export function TaskList({
  tasks,
  timezone = "UTC",
  groupBy = "none",
}: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  if (groupBy === "none") {
    return (
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} timezone={timezone} />
        ))}
      </div>
    );
  }

  // Group tasks using the utility
  // We cast tasks to any because TaskListTask is structurally compatible
  // with TaskWithCategory (both have category with name/color)
  const groups = groupTasks(tasks as unknown as Parameters<typeof groupTasks>[0], groupBy, timezone);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <TaskGroupHeader label={group.label} count={group.tasks.length} />
          <div className="flex flex-col gap-3">
            {group.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task as unknown as TaskListTask}
                timezone={timezone}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
