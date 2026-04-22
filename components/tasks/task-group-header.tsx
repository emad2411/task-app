"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskGroupHeaderProps {
  label: string;
  count: number;
}

export function TaskGroupHeader({ label, count }: TaskGroupHeaderProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        "flex w-full items-center justify-between border-b py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring",
        collapsed && "mb-0"
      )}
      aria-expanded={!collapsed}
    >
      <span>
        {label}{" "}
        <span className="text-xs text-muted-foreground">({count})</span>
      </span>
      {collapsed ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
