"use client";

import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  color: string | null;
  className?: string;
  variant?: "inline" | "chip";
}

export function CategoryBadge({
  name,
  color,
  className,
  variant = "inline",
}: CategoryBadgeProps) {
  if (!name) return null;

  const dotColor = color || "#6B7280";

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm",
          "bg-muted/50 text-muted-foreground",
          className
        )}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span>{name}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span>{name}</span>
    </span>
  );
}