import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

// Set DATABASE_URL env var before running this script
// Example: $env:DATABASE_URL="postgresql://..."; npx tsx scripts/seed.ts

// Target existing user ID — set via SEED_USER_ID environment variable
const seedUserId = process.env.SEED_USER_ID;
if (!seedUserId) {
  console.error(
    "❌ SEED_USER_ID environment variable is required.\n" +
    "   Set it to the ID of an existing user in your database.\n" +
    '   Example: $env:SEED_USER_ID="your-user-id"; npx tsx scripts/seed.ts'
  );
  process.exit(1);
}
const TARGET_USER_ID: string = seedUserId;

/** Shape of category entries in mock-data.json */
interface MockCategory {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape of task entries in mock-data.json */
interface MockTask {
  id: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
}

/**
 * Compute a Date relative to now. `daysOffset` can be negative (past) or
 * positive (future). Times are anchored to 09:00 local to keep behaviour
 * predictable and avoid all-day tasks landing at midnight.
 */
function relativeDate(daysOffset: number, hour = 9, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seed() {
  const { db } = await import("@/lib/db");
  const { users, categories, tasks, userPreferences } = await import("@/lib/db/schema");
  const { default: mockData } = await import("@/lib/db/mock-data.json");

  console.log("Seeding database...");

  // Verify target user exists
  const existingUser = await db.select().from(users).where(eq(users.id, TARGET_USER_ID)).limit(1);
  if (existingUser.length === 0) {
    console.error(`User with ID "${TARGET_USER_ID}" not found. Please sign up first.`);
    process.exit(1);
  }
  console.log(`Using existing user: ${existingUser[0].name} (${TARGET_USER_ID})`);

  // Clear any existing data for this user so the seed is idempotent
  await db.delete(tasks).where(eq(tasks.userId, TARGET_USER_ID));
  await db.delete(categories).where(eq(categories.userId, TARGET_USER_ID));
  await db.delete(userPreferences).where(eq(userPreferences.userId, TARGET_USER_ID));
  console.log("Cleared existing tasks, categories and preferences for user");

  const now = new Date();
  const createdAt = now;
  const updatedAt = now;

  // Map category IDs to new UUIDs
  const categoryIdMap = new Map<string, string>();
  for (const cat of mockData.categories) {
    const newId = randomUUID();
    categoryIdMap.set(cat.id, newId);
  }

  // Insert categories with proper UUIDs for target user
  const categoriesToInsert = mockData.categories.map((cat: MockCategory) => ({
    id: categoryIdMap.get(cat.id)!,
    userId: TARGET_USER_ID,
    name: cat.name,
    color: cat.color,
    createdAt,
    updatedAt,
  }));

  if (categoriesToInsert.length > 0) {
    await db.insert(categories).values(categoriesToInsert);
    console.log(`Inserted ${categoriesToInsert.length} categories`);
  }

  // Build a per-task date plan relative to today so the dashboard reflects a
  // realistic spread of overdue / due-soon / completed items. Each entry maps
  // a task index to { dueInDays, completedInDays | null }.
  const taskDatePlan: { dueInDays: number | null; completedInDays: number | null }[] = mockData.tasks.map(
    (task: MockTask) => {
      const isDone = task.status === "done" || task.status === "archived";
      const due = task.dueDate ? new Date(task.dueDate) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;
      // Reference point: the original due date relative to the original
      // "now" (2026-05-12). Use that offset so relative spacing is preserved.
      const refNow = new Date("2026-05-12T00:00:00.000Z");
      const dueInDays = due
        ? Math.round((due.getTime() - refNow.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const completedInDays = completed
        ? Math.round((completed.getTime() - refNow.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      // Completed/archived items always get a concrete completedAt in the past.
      const completedOffset = isDone
        ? completedInDays ?? -2
        : null;
      return { dueInDays, completedInDays: completedOffset };
    }
  );

  // Insert tasks with proper UUIDs and mapped category IDs for target user
  const tasksToInsert = mockData.tasks.map((task: MockTask, idx: number) => {
    const plan = taskDatePlan[idx];
    return {
      id: randomUUID(),
      userId: TARGET_USER_ID,
      categoryId: task.categoryId ? categoryIdMap.get(task.categoryId) ?? null : null,
      title: task.title,
      description: task.description,
      status: task.status as "todo" | "in_progress" | "done" | "archived",
      priority: task.priority as "low" | "medium" | "high",
      dueDate: plan.dueInDays === null ? null : relativeDate(plan.dueInDays, 17),
      completedAt: plan.completedInDays === null ? null : relativeDate(plan.completedInDays, 16),
      createdAt,
      updatedAt,
    };
  });

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
    createdAt: now,
    updatedAt: now,
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
