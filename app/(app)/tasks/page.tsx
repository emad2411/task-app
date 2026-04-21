import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getTasks, getCategoriesForUser } from "@/lib/data/task";
import { getDashboardData } from "@/lib/data/dashboard";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFilters } from "@/components/tasks/task-filters";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";

interface TasksPageProps {
  searchParams: Promise<{ status?: string; priority?: string }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  await connection();
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const statusFilter = params.status as TaskStatus | undefined;
  const priorityFilter = params.priority as TaskPriority | undefined;

  const [tasks, categories, { timezone }] = await Promise.all([
    getTasks(user.id, {
      status: statusFilter,
      priority: priorityFilter,
    }),
    getCategoriesForUser(user.id),
    getDashboardData(user.id),
  ]);

  const hasFilters = statusFilter || priorityFilter;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateTaskDialog categories={categories} />
        </div>

        <TaskFilters />

        {tasks.length > 0 ? (
          <TaskList tasks={tasks} timezone={timezone} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {hasFilters ? "No tasks match your filters" : "No tasks yet"}
              </h3>
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Try adjusting your filters or clear them to see all tasks."
                  : "Get started by creating your first task."}
              </p>
              {!hasFilters && <CreateTaskDialog categories={categories} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
