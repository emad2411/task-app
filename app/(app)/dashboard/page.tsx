import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PrioritySummary } from "@/components/dashboard/priority-summary";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { EmptyState } from "@/components/dashboard/empty-state";

/**
 * Dashboard Page
 *
 * This is the main landing page for authenticated users. It displays:
 * - User header with avatar, profile link, logout, and theme toggle
 * - Quick action buttons (New Task, View All, Manage Categories)
 * - Stats cards (Due Today, Overdue, Completed Today, Total Active)
 * - Priority distribution summary
 * - Upcoming tasks list (next 7 days)
 * - Empty state for new users with no tasks
 *
 * Architecture:
 * - Server Component that fetches data via getDashboardData()
 * - All database queries happen server-side, scoped to authenticated user
 * - Data is passed as props to child components
 * - Loading state handled by loading.tsx
 * - Error state handled by error.tsx
 */
export default async function DashboardPage() {
  // Force dynamic rendering - prevents prerendering for auth-protected pages
  await connection();

  // Verify user is authenticated - redirects to sign-in if not
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all dashboard data for this user
  // This server function handles all database queries and timezone calculations
  const { stats, priorityDistribution, upcomingTasks, timezone } =
    await getDashboardData(user.id);

  // Determine if user has any active tasks (for empty state)
  const hasTasks = stats.totalActive > 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky header with user avatar, name, profile, logout, theme toggle */}
      <DashboardHeader
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
      />

      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Page Header - Title and welcome message */}
        <div className="space-y-1">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s your task overview.
          </p>
        </div>

        {/* Quick Action Buttons - New Task, View All, Manage Categories */}
        <QuickActions />

        {/* Main Dashboard Content */}
        {hasTasks ? (
          <div className="space-y-6">
            {/* Stats Cards Grid - 4 cards: Due Today, Overdue, Completed, Total */}
            <StatsCards stats={stats} />

            {/* Two-column layout: Priority Summary | Upcoming Tasks */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Priority Distribution - Takes 1/3 on desktop */}
              <PrioritySummary distribution={priorityDistribution} />

              {/* Upcoming Tasks List - Takes 2/3 on desktop */}
              <div className="lg:col-span-2">
                <UpcomingTasks tasks={upcomingTasks} timezone={timezone} />
              </div>
            </div>
          </div>
        ) : (
          /* Empty state for new users with no tasks */
          <EmptyState />
        )}
      </main>
    </div>
  );
}
