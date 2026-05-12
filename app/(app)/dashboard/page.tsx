import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import {
  getDashboardData,
  getCompletionTrend,
  getCategoryBreakdown,
  getWeeklyVelocity,
} from "@/lib/data/dashboard";
import { MetricsStrip } from "@/components/dashboard/metrics-strip";
import { CompletionTrend } from "@/components/dashboard/completion-trend";
import { PriorityDonut } from "@/components/dashboard/priority-donut";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { WeeklyVelocity } from "@/components/dashboard/weekly-velocity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";

export default async function DashboardPage() {
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ stats, priorityDistribution, upcomingTasks, timezone }, completionTrend, categoryBreakdown, weeklyVelocity] =
    await Promise.all([
      getDashboardData(user.id),
      getCompletionTrend(user.id, 14),
      getCategoryBreakdown(user.id),
      getWeeklyVelocity(user.id, 8),
    ]);

  const hasTasks = stats.totalActive > 0 || stats.completedToday > 0;

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}.
        </p>
      </div>

      {hasTasks ? (
        <>
          <MetricsStrip stats={stats} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CompletionTrend data={completionTrend} />
            <WeeklyVelocity data={weeklyVelocity} />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <PriorityDonut distribution={priorityDistribution} />
            <CategoryBreakdown categories={categoryBreakdown} />
          </div>

          <UpcomingTasks tasks={upcomingTasks} timezone={timezone} />
        </>
      ) : (
        <DashboardEmptyState />
      )}
    </div>
  );
}
