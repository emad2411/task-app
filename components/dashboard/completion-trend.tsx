"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CompletionTrendDay } from "@/lib/data/dashboard";

interface CompletionTrendProps {
  data: CompletionTrendDay[];
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "oklch(72% 0.14 180)",
  },
} satisfies ChartConfig;

export function CompletionTrend({ data }: CompletionTrendProps) {
  const hasData = data.some((d) => d.completed > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">
          Completion Trend
        </h2>
        <span className="text-xs text-muted-foreground">Last 14 days</span>
      </div>

      {hasData ? (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(72% 0.14 180)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(72% 0.14 180)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="none"
            />
            <XAxis
              dataKey="date"
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
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="oklch(72% 0.14 180)"
              strokeWidth={2}
              fill="url(#completionGradient)"
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No completions yet. Finish a task to see your trend.
          </p>
        </div>
      )}
    </div>
  );
}
