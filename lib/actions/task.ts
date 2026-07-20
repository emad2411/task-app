"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
import { getCurrentUserId } from "@/lib/auth/session";
import { getCategoryById } from "@/lib/data/category";
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";
import { getUserTimezone } from "@/lib/data/preferences";
import { datetimeLocalToUtc } from "@/lib/utils/date";

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createTaskSchema.parse(input);
    const timezone = await getUserTimezone(userId);

    if (validated.categoryId) {
      const owned = await getCategoryById(userId, validated.categoryId);
      if (!owned) {
        return { success: false, error: "Invalid category" };
      }
    }

    const [task] = await db.insert(tasks).values({
      ...validated,
      userId,
      description: validated.description || null,
      dueDate: validated.dueDate ? datetimeLocalToUtc(validated.dueDate, timezone) : null,
      categoryId: validated.categoryId || null,
    }).returning();

    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: task };
  } catch (error) {
    return handleActionError("[createTaskAction]", error, "Failed to create task");
  }
}

export async function updateTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateTaskSchema.parse(input);
    const { id, ...data } = validated;
    const timezone = await getUserTimezone(userId);

    if (data.categoryId) {
      const owned = await getCategoryById(userId, data.categoryId);
      if (!owned) {
        return { success: false, error: "Invalid category" };
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) {
      updates.title = data.title;
    }
    if (data.description !== undefined) {
      updates.description = data.description || null;
    }
    if (data.status !== undefined) {
      updates.status = data.status;
    }
    if (data.priority !== undefined) {
      updates.priority = data.priority;
    }
    if (data.dueDate !== undefined) {
      updates.dueDate = data.dueDate ? datetimeLocalToUtc(data.dueDate, timezone) : null;
    }
    if (data.categoryId !== undefined) {
      updates.categoryId = data.categoryId || null;
    }

    const [task] = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: task };
  } catch (error) {
    return handleActionError("[updateTaskAction]", error, "Failed to update task");
  }
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db.delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    if (result.length === 0) {
      return { success: false, error: "Task not found" };
    }
    
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true };
  } catch (error) {
    return handleActionError("[deleteTaskAction]", error, "Failed to delete task");
  }
}

export async function toggleTaskCompletionAction(taskId: string): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });
    
    if (!task) return { success: false, error: "Task not found" };
    
    const isDone = task.status === "done";
    
    await db.update(tasks)
      .set({
        status: isDone ? "todo" : "done",
        completedAt: isDone ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true };
  } catch (error) {
    return handleActionError("[toggleTaskCompletionAction]", error, "Failed to update task");
  }
}

export async function archiveTaskAction(taskId: string): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const [task] = await db.update(tasks)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    if (!task) {
      return { success: false, error: "Task not found" };
    }
    
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true };
  } catch (error) {
    return handleActionError("[archiveTaskAction]", error, "Failed to archive task");
  }
}
