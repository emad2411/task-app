import { getTasks, getTaskCount } from "@/lib/data/task";
import { TaskList } from "./task-list";
import { TaskEmptyState } from "./task-empty-state";
import type { TaskQueryParams } from "@/lib/validation/task";

interface TaskListLoaderProps {
  userId: string;
  query: Partial<TaskQueryParams>;
  timezone: string;
}

export async function TaskListLoader({ userId, query, timezone }: TaskListLoaderProps) {
  const statusFilter = query.status;
  const priorityFilter = query.priority;
  const categoryFilter = query.category;
  const searchQuery = query.q;
  const dueDateFilter = query.dueDate;
  const sortField = query.sort;
  const sortOrder = query.order;
  const groupBy = query.groupBy ?? "none";

  const [tasks, totalTaskCount] = await Promise.all([
    getTasks(
      userId,
      {
        status: statusFilter,
        priority: priorityFilter,
        categoryId: categoryFilter,
        search: searchQuery,
        dueDate: dueDateFilter,
        sortField,
        sortOrder,
      },
      timezone
    ),
    getTaskCount(userId),
  ]);

  const hasFilters =
    !!statusFilter?.length ||
    !!priorityFilter?.length ||
    !!categoryFilter ||
    !!searchQuery ||
    !!dueDateFilter;

  const hasSortOrGroup =
    sortField !== undefined || sortOrder !== undefined || groupBy !== "none";

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {tasks.length === totalTaskCount
          ? `Showing ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
          : `Showing ${tasks.length} of ${totalTaskCount} task${totalTaskCount !== 1 ? "s" : ""}`}
      </p>

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} timezone={timezone} groupBy={groupBy} />
      ) : (
        <TaskEmptyState hasFilters={hasFilters || hasSortOrGroup} />
      )}
    </>
  );
}
