import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get user preferences by user ID.
 *
 * @param userId - The authenticated user's ID
 * @returns The user's preferences record, or null if not found
 */
export async function getUserPreferences(userId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-preferences`);

  return db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
}

/**
 * Create or update user preferences.
 *
 * @param userId - The authenticated user's ID
 * @param data - Partial preferences data to update
 * @returns The created or updated preferences record
 */
export async function upsertUserPreferences(
  userId: string,
  data: Partial<{
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: string;
    defaultTaskSort: string;
  }>
) {
  const [result] = await db
    .insert(userPreferences)
    .values({
      userId,
      theme: data.theme ?? "system",
      timezone: data.timezone ?? "UTC",
      dateFormat: data.dateFormat ?? "MM/dd/yyyy",
      defaultTaskSort: data.defaultTaskSort ?? "due_date_asc",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result;
}

/**
 * Get just the user's timezone preference.
 *
 * This is a lightweight alternative to getDashboardData() when you
 * only need the timezone string (e.g., for the tasks page).
 *
 * @param userId - The authenticated user's ID
 * @returns The user's timezone string, defaults to "UTC"
 */
export async function getUserTimezone(userId: string): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-preferences`);

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
    columns: { timezone: true },
  });
  return prefs?.timezone ?? "UTC";
}
