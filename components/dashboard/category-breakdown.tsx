"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryBreakdownItem } from "@/lib/data/dashboard";

interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[];
}

const fallbackColor = "#6b7280";
const INITIAL_LIMIT = 6;

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(...categories.map((c) => c.taskCount), 1);
  const hasMore = categories.length > INITIAL_LIMIT;
  const visibleCategories = expanded
    ? categories
    : categories.slice(0, INITIAL_LIMIT);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">By Category</h2>

      {categories.length > 0 ? (
        <div className="space-y-2.5">
          {visibleCategories.map((cat) => {
            const percentage = Math.round((cat.taskCount / maxCount) * 100);
            const color = cat.color || fallbackColor;
            const href =
              cat.id === "uncategorized"
                ? "/tasks?category=none"
                : `/tasks?category=${cat.id}`;

            return (
              <Link
                key={cat.id}
                href={href}
                className="group block transition-opacity hover:opacity-80"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate max-w-[160px]">{cat.name}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {cat.taskCount}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </Link>
            );
          })}

          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-center gap-1 pt-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  +{categories.length - INITIAL_LIMIT} more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No categories yet</p>
        </div>
      )}
    </div>
  );
}
