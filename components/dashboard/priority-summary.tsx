import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PrioritySummaryProps {
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export function PrioritySummary({ distribution }: PrioritySummaryProps) {
  const total = distribution.high + distribution.medium + distribution.low;

  const priorities = [
    {
      label: "High",
      count: distribution.high,
      color: "bg-red-500",
      badgeVariant: "destructive" as const,
    },
    {
      label: "Medium",
      count: distribution.medium,
      color: "bg-amber-500",
      badgeVariant: "secondary" as const,
    },
    {
      label: "Low",
      count: distribution.low,
      color: "bg-blue-500",
      badgeVariant: "default" as const,
    },
  ];

  // Calculate percentages for the segmented bar
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segmented progress bar */}
        {total > 0 && (
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {distribution.high > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${getPercentage(distribution.high)}%` }}
                title={`High: ${distribution.high}`}
              />
            )}
            {distribution.medium > 0 && (
              <div
                className="bg-amber-500"
                style={{ width: `${getPercentage(distribution.medium)}%` }}
                title={`Medium: ${distribution.medium}`}
              />
            )}
            {distribution.low > 0 && (
              <div
                className="bg-blue-500"
                style={{ width: `${getPercentage(distribution.low)}%` }}
                title={`Low: ${distribution.low}`}
              />
            )}
          </div>
        )}

        {/* Priority list */}
        <div className="space-y-2">
          {priorities.map((priority) => (
            <div
              key={priority.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${priority.color}`} />
                <span className="text-sm">{priority.label}</span>
              </div>
              <Badge variant={priority.badgeVariant}>
                {priority.count}
              </Badge>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Active</span>
            <span className="font-medium">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
