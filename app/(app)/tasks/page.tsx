import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getTasks, getCategoriesForUser, getTaskCount } from "@/lib/data/task";
import { getDashboardData } from "@/lib/data/dashboard";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilters } from "@/components/tasks/task-filters";
import { FilterChips } from "@/components/tasks/filter-chips";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { taskQueryParamsSchema } from "@/lib/validation/task";

interface TasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  await connection();
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  // Validate and sanitize URL params
  const validated = taskQueryParamsSchema.safeParse(params);
  const query = validated.success ? validated.data : {};

  const statusFilter = query.status;
  const priorityFilter = query.priority;
  const categoryFilter = query.category;
  const searchQuery = query.q;
  const dueDateFilter = query.dueDate;
  const sortField = query.sort;
  const sortOrder = query.order;
  const groupBy = query.groupBy ?? "none";

  // Get timezone first (needed for due date filtering)
  const { timezone } = await getDashboardData(user.id);

  // Fetch tasks, categories, and total count in parallel
  const [tasks, categories, totalTaskCount] = await Promise.all([
    getTasks(
      user.id,
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
    getCategoriesForUser(user.id),
    getTaskCount(user.id),
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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {tasks.length === totalTaskCount
                ? `Showing ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
                : `Showing ${tasks.length} of ${totalTaskCount} task${totalTaskCount !== 1 ? "s" : ""}`}
            </p>
          </div>
          <CreateTaskDialog categories={categories} />
        </div>

        <TaskFilters categories={categories} />
        <FilterChips categories={categories} />

        {tasks.length > 0 ? (
          <TaskList
            tasks={tasks}
            timezone={timezone}
            groupBy={groupBy}
          />
        ) : (
          <TaskEmptyState
            hasFilters={hasFilters || hasSortOrGroup}
            categories={categories}
          />
        )}
      </main>
    </div>
  );
}
