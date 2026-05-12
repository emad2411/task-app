import { cacheTag, cacheLife } from "next/cache";
import { eq, and, count, gte, lt, asc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, userPreferences, categories } from "@/lib/db/schema";
import { TaskPriority, TaskStatus } from "@/lib/db/schema";
import {
  getStartOfTodayInTimezone,
  getEndOfTodayInTimezone,
  getUpcomingThreshold,
} from "@/lib/utils/date";

/**
 * ============================================================================
 * DASHBOARD DATA TYPES
 * ============================================================================
 * These interfaces define the shape of data returned by dashboard queries.
 */

/**
 * Statistics displayed in the dashboard stat cards
 * @property dueToday - Number of tasks due today
 * @property overdue - Number of overdue tasks (past due, not completed)
 * @property completedToday - Number of tasks completed today
 * @property totalActive - Total number of active (non-archived) tasks
 */
export interface DashboardStats {
  dueToday: number;
  overdue: number;
  completedToday: number;
  totalActive: number;
}

/**
 * Distribution of tasks by priority level
 * Shows how many high/medium/low priority tasks user has
 */
export interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
}

/**
 * Simplified task data for upcoming tasks list
 * Contains only the fields needed for display on the dashboard
 */
export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: {
    name: string;
    color: string | null;
  } | null;
}

/**
 * Complete dashboard data structure
 * This is what the getDashboardData function returns
 */
export interface DashboardData {
  stats: DashboardStats;
  priorityDistribution: PriorityDistribution;
  upcomingTasks: UpcomingTask[];
  timezone: string;
}

/**
 * ============================================================================
 * DASHBOARD DATA FETCHER
 * ============================================================================
 * This server function fetches all data needed for the dashboard.
 * 
 * SECURITY: This function MUST be called from a Server Component or another
 * Server Action. The userId parameter must come from authenticated session
 * (via requireAuth() or similar), NEVER from client-side input.
 * 
 * PERFORMANCE: All queries are scoped by userId and use database indexes.
 * Results are cached at the component level via Next.js async Server Components.
 * 
 * TIMEZONE HANDLING: All date calculations respect the user's timezone preference
 * stored in userPreferences. Falls back to UTC if not set.
 */

/**
 * Fetches all dashboard data for the given user
 * 
 * @param userId - The authenticated user's ID (must be validated by caller)
 * @returns DashboardData containing stats, priority distribution, and upcoming tasks
 * @throws May throw database errors (handled by Next.js error boundary)
 * 
 * @example
 * ```typescript
 * const { user } = await requireAuth();
 * const data = await getDashboardData(user.id);
 * ```
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-dashboard`);

  // ==========================================================================
  // STEP 1: Get user's timezone preference
  // ==========================================================================
  // We need the user's timezone to calculate date boundaries correctly.
  // Date comparisons in SQL must use UTC timestamps, but the meaning of
  // "today" depends on where the user is located.
  
  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  const timezone = preferences?.timezone ?? "UTC";

  // ==========================================================================
  // STEP 2: Calculate time boundaries in user's timezone
  // ==========================================================================
  // Convert "today" in user's timezone to UTC timestamps for database queries.
  // These timestamps mark the start/end of today in the user's local time.
  
  const todayStart = getStartOfTodayInTimezone(timezone);     // e.g., 2026-04-21 07:00:00 UTC
  const todayEnd = getEndOfTodayInTimezone(timezone);         // e.g., 2026-04-22 06:59:59 UTC
  const upcomingThreshold = getUpcomingThreshold(timezone, 7); // 7 days from end of today

  // ==========================================================================
  // STEP 3: Fetch dashboard statistics (4 counts)
  // ==========================================================================
  // Each query counts tasks matching specific criteria.
  // All queries are scoped to the authenticated user and use indexed columns.
  
  // --- All 4 stats in a single query using conditional aggregation ---
  // Each CASE expression counts rows matching specific criteria.
  // This reduces 4 database round trips to 1.
  const [statsResult] = await db
    .select({
      dueToday: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' and ${tasks.dueDate} >= ${todayStart} and ${tasks.dueDate} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
      overdue: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' and ${tasks.dueDate} < ${todayStart} and ${tasks.completedAt} is null then 1 else 0 end), 0)`.mapWith(Number),
      completedToday: sql<number>`coalesce(sum(case when ${tasks.completedAt} >= ${todayStart} and ${tasks.completedAt} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
      totalActive: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' then 1 else 0 end), 0)`.mapWith(Number),
    })
    .from(tasks)
    .where(eq(tasks.userId, userId));

  // ==========================================================================
  // STEP 4: Fetch priority distribution
  // ==========================================================================
  // Group active tasks by priority level (high/medium/low)
  // Used to render the priority distribution bar chart
  
  const priorityCounts = await db
    .select({
      priority: tasks.priority,
      count: count(),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo")
      )
    )
    .groupBy(tasks.priority);

  // Convert query result to structured object
  // Default to 0 if a priority level has no tasks
  const priorityDistribution = {
    high: priorityCounts.find((p) => p.priority === "high")?.count ?? 0,
    medium: priorityCounts.find((p) => p.priority === "medium")?.count ?? 0,
    low: priorityCounts.find((p) => p.priority === "low")?.count ?? 0,
  };

  // ==========================================================================
  // STEP 5: Fetch upcoming tasks (next 7 days)
  // ==========================================================================
  // Get up to 5 tasks due within the next 7 days, ordered by due date.
  // Include category data via Drizzle relations for display badges.
  
  const upcomingTasksResult = await db.query.tasks.findMany({
    where: and(
      eq(tasks.userId, userId),
      eq(tasks.status, "todo"),                    // Only active tasks
      gte(tasks.dueDate, todayStart),              // Due >= today
      lt(tasks.dueDate, upcomingThreshold)         // Due < 7 days from now
    ),
    orderBy: asc(tasks.dueDate),                   // Soonest first
    limit: 5,                                      // Max 5 items
    with: {
      category: true,                              // Join with categories table
    },
  });

  // Map database results to the UpcomingTask interface
  // We only need a subset of fields for the dashboard list
  const upcomingTasks: UpcomingTask[] = upcomingTasksResult.map((task) => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    category: task.category
      ? {
          name: task.category.name,
          color: task.category.color,
        }
      : null,
  }));

  // ==========================================================================
  // STEP 6: Return consolidated dashboard data
  // ==========================================================================
  
  return {
    stats: {
      dueToday: statsResult?.dueToday ?? 0,
      overdue: statsResult?.overdue ?? 0,
      completedToday: statsResult?.completedToday ?? 0,
      totalActive: statsResult?.totalActive ?? 0,
    },
    priorityDistribution,
    upcomingTasks,
    timezone,
  };
}

/**
 * ============================================================================
 * ANALYTICS DATA TYPES
 * ============================================================================
 */

export interface CompletionTrendDay {
  date: string;
  completed: number;
}

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  color: string | null;
  taskCount: number;
}

/**
 * ============================================================================
 * COMPLETION TREND FETCHER
 * ============================================================================
 * Returns daily completion counts for the last N days.
 * Each day is counted in the user's timezone.
 */
export async function getCompletionTrend(
  userId: string,
  days: number = 14
): Promise<CompletionTrendDay[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-dashboard`);

  const preferences = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  const timezone = preferences?.timezone ?? "UTC";

  const now = new Date();
  const results: CompletionTrendDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - i);

    const dayStart = getStartOfTodayInTimezone(timezone);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = getEndOfTodayInTimezone(timezone);
    dayEnd.setDate(dayEnd.getDate() - i);

    const [row] = await db
      .select({
        completed: sql<number>`coalesce(count(*), 0)`.mapWith(Number),
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.completedAt, dayStart),
          lt(tasks.completedAt, dayEnd)
        )
      );

    const dateLabel = dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });

    results.push({
      date: dateLabel,
      completed: row?.completed ?? 0,
    });
  }

  return results;
}

/**
 * ============================================================================
 * CATEGORY BREAKDOWN FETCHER
 * ============================================================================
 * Returns task counts grouped by category, including uncategorized tasks.
 */
export async function getCategoryBreakdown(
  userId: string
): Promise<CategoryBreakdownItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-dashboard`);

  const categoryCounts = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(
      tasks,
      and(
        eq(tasks.categoryId, categories.id),
        eq(tasks.userId, userId),
        eq(tasks.status, "todo")
      )
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id, categories.name, categories.color)
    .orderBy(sql`count(${tasks.id}) desc`);

  const [uncategorized] = await db
    .select({
      taskCount: sql<number>`coalesce(count(*), 0)`.mapWith(Number),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo"),
        sql`${tasks.categoryId} is null`
      )
    );

  const uncategorizedCount = uncategorized?.taskCount ?? 0;
  const result: CategoryBreakdownItem[] = [...categoryCounts];

  if (uncategorizedCount > 0) {
    result.push({
      id: "uncategorized",
      name: "Uncategorized",
      color: null,
      taskCount: uncategorizedCount,
    });
  }

  return result.sort((a, b) => b.taskCount - a.taskCount);
}

/**
 * ============================================================================
 * WEEKLY VELOCITY FETCHER
 * ============================================================================
 * Returns weekly completion counts for the last N weeks.
 */
export async function getWeeklyVelocity(
  userId: string,
  weeks: number = 8
): Promise<Array<{ week: string; completed: number }>> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-dashboard`);

  const results: Array<{ week: string; completed: number }> = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const [row] = await db
      .select({
        completed: sql<number>`coalesce(count(*), 0)`.mapWith(Number),
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.completedAt, weekStart),
          lt(tasks.completedAt, weekEnd)
        )
      );

    const weekLabel = `W${weeks - i}`;

    results.push({
      week: weekLabel,
      completed: row?.completed ?? 0,
    });
  }

  return results;
}
