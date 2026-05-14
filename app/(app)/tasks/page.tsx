import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getCategoriesForUser } from "@/lib/data/task";
import { getUserTimezone } from "@/lib/data/preferences";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskListLoader } from "@/components/tasks/task-list-loader";
import { TaskSkeleton } from "@/components/tasks/task-skeleton";
import { taskQueryParamsSchema } from "@/lib/validation/task";

interface TasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  const validated = taskQueryParamsSchema.safeParse(params);
  const query = validated.success ? validated.data : {};

  // Fast: only fetch what filters need immediately
  const [timezone, categories] = await Promise.all([
    getUserTimezone(user.id),
    getCategoriesForUser(user.id),
  ]);

  return (
    <main className="space-y-4 p-4 md:p-6">
      <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Tasks</h1>

      {/* Filters: client component with useSearchParams, needs Suspense */}
      <Suspense fallback={<div className="h-9" />}>
        <TaskFilters categories={categories} />
      </Suspense>

      {/* Task list: streams in, shows skeleton on filter changes */}
      <Suspense
        key={JSON.stringify(query)}
        fallback={<TaskSkeleton />}
      >
        <TaskListLoader userId={user.id} query={query} timezone={timezone} />
      </Suspense>
    </main>
  );
}
