import {
  eq,
  and,
  or,
  ilike,
  desc,
  asc,
  count,
  gte,
  lte,
  isNull,
  sql,
  inArray,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, categories } from "@/lib/db/schema";
import type { TaskStatus, TaskPriority } from "@/lib/db/schema";
import {
  getStartOfTodayInTimezone,
  getEndOfTodayInTimezone,
} from "@/lib/utils/date";

export interface GetTasksOptions {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  categoryId?: string;
  search?: string;
  dueDate?: "today" | "upcoming" | "overdue" | "none";
  sortField?: "dueDate" | "createdAt" | "updatedAt" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

function normalizeToArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

export async function getTasks(
  userId: string,
  options?: GetTasksOptions,
  timezone: string = "UTC"
) {
  const conditions = [eq(tasks.userId, userId)];

  // Status filter
  const statuses = normalizeToArray(options?.status);
  if (statuses.length > 0) {
    conditions.push(inArray(tasks.status, statuses));
  }

  // Priority filter
  const priorities = normalizeToArray(options?.priority);
  if (priorities.length > 0) {
    conditions.push(inArray(tasks.priority, priorities));
  }

  // Category filter
  if (options?.categoryId) {
    conditions.push(eq(tasks.categoryId, options.categoryId));
  }

  // Search filter
  if (options?.search) {
    const searchCondition = or(
      ilike(tasks.title, `%${options.search}%`),
      ilike(tasks.description, `%${options.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Due date filter
  if (options?.dueDate) {
    const startOfToday = getStartOfTodayInTimezone(timezone);
    const endOfToday = getEndOfTodayInTimezone(timezone);

    switch (options.dueDate) {
      case "today": {
        const cond = and(
          gte(tasks.dueDate, startOfToday),
          lte(tasks.dueDate, endOfToday)
        );
        if (cond) conditions.push(cond);
        break;
      }
      case "upcoming":
        conditions.push(gte(tasks.dueDate, endOfToday));
        break;
      case "overdue": {
        const statusCond = or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress"));
        const cond = statusCond
          ? and(lte(tasks.dueDate, startOfToday), statusCond)
          : lte(tasks.dueDate, startOfToday);
        if (cond) conditions.push(cond);
        break;
      }
      case "none":
        conditions.push(isNull(tasks.dueDate));
        break;
    }
  }

  // Sorting
  const sortField = options?.sortField ?? "dueDate";
  const sortOrder = options?.sortOrder ?? "asc";

  const orderByClause = [];

  if (sortField === "dueDate") {
    // Null due dates sort to bottom when ascending
    orderByClause.push(
      sortOrder === "asc"
        ? asc(sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`)
        : desc(sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`)
    );
    orderByClause.push(
      sortOrder === "asc" ? asc(tasks.dueDate) : desc(tasks.dueDate)
    );
  } else if (sortField === "priority") {
    // Priority order: high > medium > low
    orderByClause.push(
      sortOrder === "asc"
        ? asc(
            sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`
          )
        : desc(
            sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`
          )
    );
  } else if (sortField === "title") {
    orderByClause.push(
      sortOrder === "asc" ? asc(tasks.title) : desc(tasks.title)
    );
  } else if (sortField === "createdAt") {
    orderByClause.push(
      sortOrder === "asc" ? asc(tasks.createdAt) : desc(tasks.createdAt)
    );
  } else if (sortField === "updatedAt") {
    orderByClause.push(
      sortOrder === "asc" ? asc(tasks.updatedAt) : desc(tasks.updatedAt)
    );
  }

  // Secondary sorts: priority desc, then createdAt desc
  if (sortField !== "priority") {
    orderByClause.push(
      desc(
        sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`
      )
    );
  }
  if (sortField !== "createdAt") {
    orderByClause.push(desc(tasks.createdAt));
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: orderByClause,
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
