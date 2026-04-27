"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
import { getCurrentUserId } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createTaskSchema.parse(input);
    
    const [task] = await db.insert(tasks).values({
      ...validated,
      userId,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      categoryId: validated.categoryId || null,
    }).returning();
    
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    return { success: true, data: task };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create task" };
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
    
    const [task] = await db.update(tasks)
      .set({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        categoryId: data.categoryId || null,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    
    if (!task) {
      return { success: false, error: "Task not found" };
    }
    
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
    return { success: true, data: task };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update task" };
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
    
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete task" };
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
    
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update task" };
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
    
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to archive task" };
  }
}
