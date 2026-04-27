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
  const existing = await getUserPreferences(userId);

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(userPreferences)
    .values({
      userId,
      theme: data.theme ?? "system",
      timezone: data.timezone ?? "UTC",
      dateFormat: data.dateFormat ?? "MM/dd/yyyy",
      defaultTaskSort: data.defaultTaskSort ?? "due_date_asc",
    })
    .returning();
  return created;
}
