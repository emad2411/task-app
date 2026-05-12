import Link from "next/link";
import { Clock, AlertCircle, CheckCircle2, ListTodo } from "lucide-react";
import type { DashboardStats } from "@/lib/data/dashboard";

interface MetricsStripProps {
  stats: DashboardStats;
}

const metrics = [
  {
    key: "dueToday" as const,
    label: "Due Today",
    icon: Clock,
    color: "text-amber-400",
    href: "/tasks?due=today",
  },
  {
    key: "overdue" as const,
    label: "Overdue",
    icon: AlertCircle,
    color: "text-red-400",
    href: "/tasks?due=overdue",
  },
  {
    key: "completedToday" as const,
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-400",
    href: "/tasks?status=done",
  },
  {
    key: "totalActive" as const,
    label: "Active",
    icon: ListTodo,
    color: "text-muted-foreground",
    href: "/tasks",
  },
];

export function MetricsStrip({ stats }: MetricsStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const value = stats[metric.key];
        const isUrgent = metric.key === "overdue" && value > 0;

        return (
          <Link
            key={metric.key}
            href={metric.href}
            className="group rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-xs text-muted-foreground">
                {metric.label}
              </span>
            </div>
            <span
              className={`mt-2 block text-2xl font-semibold tracking-tight ${
                isUrgent ? "text-red-400" : "text-foreground"
              }`}
            >
              {value}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
