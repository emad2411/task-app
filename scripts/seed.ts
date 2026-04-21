import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

// Set DATABASE_URL env var before running this script
// Example: $env:DATABASE_URL="postgresql://..."; npx tsx scripts/seed.ts

// Target existing user ID - change this to your user ID
const TARGET_USER_ID = "SVGfYh7sMn2443APsn1X8GBsqmqOaXLv";

async function seed() {
  const { db } = await import("@/lib/db");
  const { users, categories, tasks, userPreferences } = await import("@/lib/db/schema");
  const { default: mockData } = await import("@/lib/db/mock-data.json");

  console.log("Seeding database...");

  function parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr);
  }

  // Verify target user exists
  const existingUser = await db.select().from(users).where(eq(users.id, TARGET_USER_ID)).limit(1);
  if (existingUser.length === 0) {
    console.error(`User with ID "${TARGET_USER_ID}" not found. Please sign up first.`);
    process.exit(1);
  }
  console.log(`Using existing user: ${existingUser[0].name} (${TARGET_USER_ID})`);

  // Map category IDs to new UUIDs
  const categoryIdMap = new Map<string, string>();
  for (const cat of mockData.categories) {
    const newId = randomUUID();
    categoryIdMap.set(cat.id, newId);
  }

  // Insert categories with proper UUIDs for target user
  const categoriesToInsert = mockData.categories.map((cat: any) => ({
    id: categoryIdMap.get(cat.id)!,
    userId: TARGET_USER_ID,
    name: cat.name,
    color: cat.color,
    createdAt: parseDate(cat.createdAt)!,
    updatedAt: parseDate(cat.updatedAt)!,
  }));

  if (categoriesToInsert.length > 0) {
    await db.insert(categories).values(categoriesToInsert);
    console.log(`Inserted ${categoriesToInsert.length} categories`);
  }

  // Insert tasks with proper UUIDs and mapped category IDs for target user
  const tasksToInsert = mockData.tasks.map((task: any) => ({
    id: randomUUID(),
    userId: TARGET_USER_ID,
    categoryId: task.categoryId ? categoryIdMap.get(task.categoryId) ?? null : null,
    title: task.title,
    description: task.description,
    status: task.status as "todo" | "in_progress" | "done" | "archived",
    priority: task.priority as "low" | "medium" | "high",
    dueDate: parseDate(task.dueDate),
    completedAt: parseDate(task.completedAt),
    createdAt: parseDate(task.createdAt)!,
    updatedAt: parseDate(task.updatedAt)!,
  }));

  if (tasksToInsert.length > 0) {
    await db.insert(tasks).values(tasksToInsert);
    console.log(`Inserted ${tasksToInsert.length} tasks`);
  }

  // Insert or update user preferences for target user
  const prefsData = mockData.userPreferences;
  await db.insert(userPreferences).values({
    id: randomUUID(),
    userId: TARGET_USER_ID,
    theme: prefsData.theme as "light" | "dark" | "system",
    timezone: prefsData.timezone,
    dateFormat: prefsData.dateFormat,
    defaultTaskSort: prefsData.defaultTaskSort,
    createdAt: parseDate(prefsData.createdAt)!,
    updatedAt: parseDate(prefsData.updatedAt)!,
  }).onConflictDoUpdate({
    target: userPreferences.userId,
    set: {
      theme: prefsData.theme as "light" | "dark" | "system",
      timezone: prefsData.timezone,
      dateFormat: prefsData.dateFormat,
      defaultTaskSort: prefsData.defaultTaskSort,
      updatedAt: new Date(),
    }
  });
  console.log("Inserted/updated user preferences");

  console.log("Seeding completed successfully!");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
