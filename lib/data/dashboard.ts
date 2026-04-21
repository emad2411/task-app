"use server";

import { eq, and, count, gte, lt, isNull, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, userPreferences } from "@/lib/db/schema";
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
  
  // --- Stat 1: Tasks due today ---
  // Count of active tasks (todo status) where dueDate falls within today
  // Uses the tasks_user_id_due_date_idx index
  const [dueTodayResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),      // Security: scope to user
        eq(tasks.status, "todo"),      // Only active tasks
        gte(tasks.dueDate, todayStart), // Due date >= start of today
        lt(tasks.dueDate, todayEnd)     // Due date < end of today
      )
    );

  // --- Stat 2: Overdue tasks ---
  // Count of active tasks where dueDate is before today and not completed
  // Uses the tasks_user_id_due_date_idx index
  const [overdueResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo"),
        lt(tasks.dueDate, todayStart), // Due date < start of today
        isNull(tasks.completedAt)       // Not yet completed
      )
    );

  // --- Stat 3: Tasks completed today ---
  // Count of tasks where completedAt timestamp falls within today
  // Note: status could be "done" or "archived" - we count both
  const [completedTodayResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.completedAt, todayStart), // Completed >= start of today
        lt(tasks.completedAt, todayEnd)      // Completed < end of today
      )
    );

  // --- Stat 4: Total active tasks ---
  // Count of all tasks with "todo" status (not done, not archived)
  // Uses the tasks_user_id_status_idx index
  const [totalActiveResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo")
      )
    );

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
      dueToday: dueTodayResult?.count ?? 0,
      overdue: overdueResult?.count ?? 0,
      completedToday: completedTodayResult?.count ?? 0,
      totalActive: totalActiveResult?.count ?? 0,
    },
    priorityDistribution,
    upcomingTasks,
    timezone,
  };
}
