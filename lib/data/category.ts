import { cacheTag, cacheLife } from "next/cache";
import { eq, and, count, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, tasks } from "@/lib/db/schema";

export interface CategoryWithTaskCount {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
}

export async function getCategories(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);

  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}

export async function getCategoryById(userId: string, categoryId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
  });
  return category ?? null;
}

export async function getCategoryByIdWithTaskCount(
  userId: string,
  categoryId: string
): Promise<CategoryWithTaskCount | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      userId: categories.userId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(
      tasks,
      and(eq(tasks.categoryId, categories.id), eq(tasks.userId, userId))
    )
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .groupBy(categories.id);

  return result[0] ?? null;
}

export async function getCategoriesWithTaskCount(
  userId: string
): Promise<CategoryWithTaskCount[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      userId: categories.userId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(
      tasks,
      and(eq(tasks.categoryId, categories.id), eq(tasks.userId, userId))
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return result;
}

export async function getCategoriesForUser(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);

  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}