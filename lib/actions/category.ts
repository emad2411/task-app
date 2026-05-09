"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createCategorySchema, updateCategorySchema } from "@/lib/validation/category";
import { getCurrentUserId } from "@/lib/auth/session";
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";

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

    revalidateTag(`user-${userId}-categories`, { expire: 0 });
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: category };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return { success: false, error: "A category with this name already exists" };
    }
    return handleActionError("[createCategoryAction]", error, "Failed to create category");
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

    revalidateTag(`user-${userId}-categories`, { expire: 0 });
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: category };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return { success: false, error: "A category with this name already exists" };
    }
    return handleActionError("[updateCategoryAction]", error, "Failed to update category");
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

    revalidateTag(`user-${userId}-categories`, { expire: 0 });
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true };
  } catch (error) {
    return handleActionError("[deleteCategoryAction]", error, "Failed to delete category");
  }
}

