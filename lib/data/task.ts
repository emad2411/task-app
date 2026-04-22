import { eq, and, desc, asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, categories } from "@/lib/db/schema";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";

export interface GetTasksOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
}

export async function getTasks(userId: string, options?: GetTasksOptions) {
  const conditions = [eq(tasks.userId, userId)];
  
  if (options?.status) {
    conditions.push(eq(tasks.status, options.status));
  }
  if (options?.priority) {
    conditions.push(eq(tasks.priority, options.priority));
  }
  if (options?.categoryId) {
    conditions.push(eq(tasks.categoryId, options.categoryId));
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: [
      asc(tasks.dueDate),
      desc(tasks.priority),
      desc(tasks.createdAt),
    ],
    with: { category: true },
  });
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    with: { category: true },
  });
  return task ?? null;
}

export async function getTaskCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function getCategoriesForUser(userId: string) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}
