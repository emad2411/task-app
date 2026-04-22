"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createCategorySchema, updateCategorySchema } from "@/lib/validation/category";
import { getCurrentUserId } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createCategorySchema.parse(input);

    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.userId, userId),
        eq(categories.name, validated.name)
      ),
    });

    if (existing) {
      return { success: false, error: "A category with this name already exists" };
    }

    const [category] = await db.insert(categories).values({
      ...validated,
      userId,
    }).returning();

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateCategorySchema.parse(input);
    const { id, ...data } = validated;

    if (data.name) {
      const existing = await db.query.categories.findFirst({
        where: and(
          eq(categories.userId, userId),
          eq(categories.name, data.name)
        ),
      });

      if (existing && existing.id !== id) {
        return { success: false, error: "A category with this name already exists" };
      }
    }

    const [category] = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete category" };
  }
}