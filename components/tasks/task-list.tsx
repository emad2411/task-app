import { TaskRow } from "./task-row";
import { GroupedTaskList } from "./grouped-task-list";
import { groupTasks } from "@/lib/utils/task-grouping";
import type { TaskStatus, TaskPriority } from "@/lib/db/schema";

interface TaskListTask {
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
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card/50">
        <table className="w-full caption-bottom text-sm">
          <TableHeader />
          <tbody>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} timezone={timezone} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Group tasks using the utility
  const groups = groupTasks(
    tasks as unknown as Parameters<typeof groupTasks>[0],
    groupBy,
    timezone
  );

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card/50">
      <table className="w-full caption-bottom text-sm">
        <TableHeader />
        <GroupedTaskList groups={groups} timezone={timezone} />
      </table>
    </div>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-border">
        <th className="w-10 h-10 px-2 text-left align-middle" scope="col">
          <span className="sr-only">Select</span>
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground"
          scope="col"
        >
          Title
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground w-[120px] hidden md:table-cell"
          scope="col"
        >
          Status
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground w-[100px] hidden md:table-cell"
          scope="col"
        >
          Priority
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground w-[140px] hidden lg:table-cell"
          scope="col"
        >
          Category
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground w-[100px]"
          scope="col"
        >
          Due
        </th>
        <th
          className="h-10 px-2 text-left align-middle font-medium text-muted-foreground w-[120px] hidden lg:table-cell"
          scope="col"
        >
          Created
        </th>
      </tr>
    </thead>
  );
}
