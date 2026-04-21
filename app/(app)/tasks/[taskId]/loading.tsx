import { TaskDetailSkeleton } from "@/components/tasks/task-skeleton";

export default function TaskDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4 md:p-6">
        <TaskDetailSkeleton />
      </main>
    </div>
  );
}
