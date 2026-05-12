"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeeklyVelocityProps {
  data: Array<{ week: string; completed: number }>;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "oklch(65% 0.18 265)",
  },
} satisfies ChartConfig;

export function WeeklyVelocity({ data }: WeeklyVelocityProps) {
  const hasData = data.some((d) => d.completed > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">
          Weekly Velocity
        </h2>
        <span className="text-xs text-muted-foreground">Last 8 weeks</span>
      </div>

      {hasData ? (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="none"
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar
              dataKey="completed"
              fill="oklch(65% 0.18 265)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Complete tasks to see your weekly velocity.
          </p>
        </div>
      )}
    </div>
  );
}
