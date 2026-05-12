"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PriorityDistribution } from "@/lib/data/dashboard";

interface PriorityDonutProps {
  distribution: PriorityDistribution;
}

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

const chartConfig = {
  high: { label: "High", color: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#3b82f6" },
} satisfies ChartConfig;

export function PriorityDonut({ distribution }: PriorityDonutProps) {
  const total = distribution.high + distribution.medium + distribution.low;

  const chartData = [
    { name: "high", value: distribution.high, fill: priorityColors.high },
    { name: "medium", value: distribution.medium, fill: priorityColors.medium },
    { name: "low", value: distribution.low, fill: priorityColors.low },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Priority</h2>

      {total > 0 ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px] shrink-0">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" />}
                cursor={false}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={86}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm capitalize">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No active tasks</p>
        </div>
      )}
    </div>
  );
}
