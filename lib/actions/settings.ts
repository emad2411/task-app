"use server";

import { headers } from "next/headers";
import { revalidateTag, revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  type UpdateProfileInput,
  type UpdatePreferencesInput,
} from "@/lib/validation/settings";
import { getUserPreferences, upsertUserPreferences } from "@/lib/data/preferences";

/**
 * Update the authenticated user's display name.
 *
 * Uses Better Auth's updateUser API to ensure the session
 * is properly refreshed with the new name.
 *
 * @param input - The profile update input containing the new name
 * @returns Action result with success flag and optional data or error
 */
export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const userId = await requireUserId();
    const validated = updateProfileSchema.parse(input);

    // Update via Better Auth to ensure session is refreshed
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.name,
      },
    });

    // Also update directly via Drizzle as fallback/synchronization
    await db
      .update(users)
      .set({ name: validated.name, updatedAt: new Date() })
      .where(eq(users.id, userId));

    revalidateTag(`user-${userId}-preferences`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "Profile updated" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Update the authenticated user's preferences.
 * Creates a preferences record if one does not exist.
 *
 * @param input - The preferences update input
 * @returns Action result with success flag and optional data or error
 */
export async function updatePreferencesAction(input: UpdatePreferencesInput) {
  try {
    const userId = await requireUserId();
    const validated = updatePreferencesSchema.parse(input);

    await upsertUserPreferences(userId, validated);

    revalidateTag(`user-${userId}-preferences`, "max");
    revalidateTag(`user-${userId}-dashboard`, "max");
    revalidateTag(`user-${userId}-tasks`, "max");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return { success: true, data: { message: "Preferences updated" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update preferences" };
  }
}
