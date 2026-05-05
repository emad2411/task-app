"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requireUserId } from "@/lib/auth/session";

import {
  updateProfileSchema,
  updatePreferencesSchema,
  type UpdateProfileInput,
  type UpdatePreferencesInput,
} from "@/lib/validation/settings";
import { upsertUserPreferences } from "@/lib/data/preferences";
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";

/**
 * Update the authenticated user's display name.
 *
 * Uses Better Auth's updateUser API to ensure the session
 * is properly refreshed with the new name.
 *
 * @param input - The profile update input containing the new name
 * @returns Action result with success flag and optional data or error
 */
export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const validated = updateProfileSchema.parse(input);

    // Update via Better Auth — it updates the users table and refreshes the session
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.name,
      },
    });

    revalidateTag(`user-${userId}-preferences`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });

    return { success: true, data: { message: "Profile updated" } };
  } catch (error) {
    return handleActionError("[updateProfileAction]", error, "Failed to update profile");
  }
}

/**
 * Update the authenticated user's preferences.
 * Creates a preferences record if one does not exist.
 *
 * @param input - The preferences update input
 * @returns Action result with success flag and optional data or error
 */
export async function updatePreferencesAction(input: UpdatePreferencesInput): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const validated = updatePreferencesSchema.parse(input);

    await upsertUserPreferences(userId, validated);

    revalidateTag(`user-${userId}-preferences`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    revalidateTag(`user-${userId}-tasks`, { expire: 0 });

    return { success: true, data: { message: "Preferences updated" } };
  } catch (error) {
    return handleActionError("[updatePreferencesAction]", error, "Failed to update preferences");
  }
}
