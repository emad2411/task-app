"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskGroupHeaderProps {
  label: string;
  count: number;
  colSpan?: number;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function TaskGroupHeader({
  label,
  count,
  colSpan = 1,
  collapsed = false,
  onToggle,
}: TaskGroupHeaderProps) {
  return (
    <tr className="border-b border-border/60 bg-muted/30">
      <td colSpan={colSpan} className="py-2 px-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary focus:outline-none"
          )}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span>
            {label}{" "}
            <span className="text-xs text-muted-foreground">({count})</span>
          </span>
        </button>
      </td>
    </tr>
  );
}
