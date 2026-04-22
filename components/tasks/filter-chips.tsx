"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/db/schema";

interface FilterChipsProps {
  categories?: Category[];
}

interface ChipDef {
  key: string;
  label: string;
}

function useActiveChips(categories: Category[]): ChipDef[] {
  const searchParams = useSearchParams();
  const chips: ChipDef[] = [];

  const q = searchParams.get("q");
  if (q) {
    chips.push({ key: "q", label: `Search: ${q}` });
  }

  const status = searchParams.get("status");
  if (status && status !== "all") {
    const statusLabel = statusOptions[status] ?? status;
    chips.push({ key: "status", label: `Status: ${statusLabel}` });
  }

  const priority = searchParams.get("priority");
  if (priority && priority !== "all") {
    const priorityLabel = priorityOptions[priority] ?? priority;
    chips.push({ key: "priority", label: `Priority: ${priorityLabel}` });
  }

  const category = searchParams.get("category");
  if (category && category !== "all") {
    const cat = categories.find((c) => c.id === category);
    chips.push({ key: "category", label: `Category: ${cat?.name ?? category}` });
  }

  const dueDate = searchParams.get("dueDate");
  if (dueDate) {
    const dueDateLabel = dueDateOptions[dueDate] ?? dueDate;
    chips.push({ key: "dueDate", label: `Due Date: ${dueDateLabel}` });
  }

  return chips;
}

const statusOptions: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  archived: "Archived",
};

const priorityOptions: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const dueDateOptions: Record<string, string> = {
  today: "Due Today",
  upcoming: "Upcoming",
  overdue: "Overdue",
  none: "No Due Date",
};

export function FilterChips({ categories = [] }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chips = useActiveChips(categories);

  if (chips.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.replace(`/tasks?${params.toString()}`);
  }

  function clearAll() {
    router.replace("/tasks");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="h-7 gap-1 rounded-full text-xs"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => removeFilter(chip.key)}
            className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        Clear all
      </button>
    </div>
  );
}
