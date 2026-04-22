import type { Task, Category } from "@/lib/db/schema";
import { getDueDateBucket } from "@/lib/utils/date";

export type TaskWithCategory = Task & {
  category: Category | null;
};

export type TaskGroup = {
  key: string;
  label: string;
  tasks: TaskWithCategory[];
};

function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    archived: "Archived",
  };
  return labels[status] ?? status;
}

function formatDueDateBucketLabel(bucket: string): string {
  const labels: Record<string, string> = {
    overdue: "Overdue",
    today: "Today",
    upcoming: "Upcoming",
    no_due_date: "No Due Date",
  };
  return labels[bucket] ?? bucket;
}

export function groupTasks(
  tasks: TaskWithCategory[],
  groupBy: "status" | "category" | "dueDate",
  userTimezone: string = "UTC"
): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    let key: string;
    let label: string;

    if (groupBy === "status") {
      key = task.status;
      label = formatStatusLabel(task.status);
    } else if (groupBy === "category") {
      key = task.category?.id ?? "uncategorized";
      label = task.category?.name ?? "Uncategorized";
    } else {
      key = getDueDateBucket(task.dueDate, userTimezone);
      label = formatDueDateBucketLabel(key);
    }

    if (!groups.has(key)) {
      groups.set(key, { key, label, tasks: [] });
    }
    groups.get(key)!.tasks.push(task);
  }

  // Order groups logically
  if (groupBy === "status") {
    const statusOrder = ["todo", "in_progress", "done", "archived"];
    return statusOrder
      .map((s) => groups.get(s))
      .filter((g): g is TaskGroup => !!g && g.tasks.length > 0);
  }

  if (groupBy === "dueDate") {
    const dateOrder = ["overdue", "today", "upcoming", "no_due_date"];
    return dateOrder
      .map((d) => groups.get(d))
      .filter((g): g is TaskGroup => !!g && g.tasks.length > 0);
  }

  // category: alphabetical
  return Array.from(groups.values())
    .filter((g) => g.tasks.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}
