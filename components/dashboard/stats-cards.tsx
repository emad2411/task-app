import { Clock, AlertCircle, CheckCircle2, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    dueToday: number;
    overdue: number;
    completedToday: number;
    totalActive: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      title: "Due Today",
      value: stats.dueToday,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Active",
      value: stats.totalActive,
      icon: ListTodo,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
