import { TaskItem } from "./task-item";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";

interface TaskListProps {
  tasks: {
    id: string;
    title: string;
    dueDate: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    category: {
      name: string;
      color: string | null;
    } | null;
  }[];
  timezone?: string;
}

export function TaskList({ tasks, timezone = "UTC" }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} timezone={timezone} />
      ))}
    </div>
  );
}
