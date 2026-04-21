import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getTaskById, getCategoriesForUser } from "@/lib/data/task";
import { getDashboardData } from "@/lib/data/dashboard";
import { TaskDetailView } from "@/components/tasks/task-detail-view";

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  await connection();
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const { taskId } = await params;
  const [task, categories, { timezone }] = await Promise.all([
    getTaskById(user.id, taskId),
    getCategoriesForUser(user.id),
    getDashboardData(user.id),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4 md:p-6">
        <TaskDetailView
          task={{
            ...task,
            category: task.category
              ? {
                  name: task.category.name,
                  color: task.category.color,
                }
              : null,
          }}
          categories={categories}
          timezone={timezone}
        />
      </main>
    </div>
  );
}
