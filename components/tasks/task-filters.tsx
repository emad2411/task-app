"use client";

import { useEffect, useState, useCallback, useRef, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowUpDown, Group, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/lib/db/schema";

interface TaskFiltersProps {
  categories?: Category[];
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const dueDateOptions = [
  { value: "today", label: "Due Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
  { value: "none", label: "No Due Date" },
];

const sortFieldOptions = [
  { value: "dueDate", label: "Due Date" },
  { value: "createdAt", label: "Created Date" },
  { value: "updatedAt", label: "Updated Date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title (A-Z)" },
];

const groupByOptions = [
  { value: "none", label: "None" },
  { value: "status", label: "Status" },
  { value: "category", label: "Category" },
  { value: "dueDate", label: "Due Date" },
];

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  archived: "Archived",
};

const priorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const dueDateLabels: Record<string, string> = {
  today: "Due Today",
  upcoming: "Upcoming",
  overdue: "Overdue",
  none: "No Due Date",
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function TaskFilters({ categories = [] }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const category = searchParams.get("category") || "all";
  const dueDate = searchParams.get("dueDate") || "all";
  const sort = searchParams.get("sort") || "dueDate";
  const groupBy = searchParams.get("groupBy") || "none";
  const q = searchParams.get("q") || "";

  // Optimistic state for all filter values
  const [optimisticStatus, setOptimisticStatus] = useState(status);
  const [optimisticPriority, setOptimisticPriority] = useState(priority);
  const [optimisticCategory, setOptimisticCategory] = useState(category);
  const [optimisticDueDate, setOptimisticDueDate] = useState(dueDate);
  const [optimisticSort, setOptimisticSort] = useState(sort);
  const [optimisticGroupBy, setOptimisticGroupBy] = useState(groupBy);

  // Search input state with external sync
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  // Use a ref to always read latest searchParams without triggering effect re-runs
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Track the last q value we pushed to the URL so we don't sync it back and overwrite typing
  const lastPushedQ = useRef<string | null>(null);

  // Sync search input when URL changes externally (Reset button, back/forward)
  useEffect(() => {
    // Skip if this change came from our own debounce effect
    if (lastPushedQ.current !== null && q === lastPushedQ.current) {
      lastPushedQ.current = null;
      return;
    }
    startTransition(() => {
      setSearchInput(q);
    });
  }, [q]);

  // Sync optimistic state when URL changes (browser back/forward)
  useEffect(() => {
    startTransition(() => {
      setOptimisticStatus(searchParams.get("status") || "all");
      setOptimisticPriority(searchParams.get("priority") || "all");
      setOptimisticCategory(searchParams.get("category") || "all");
      setOptimisticDueDate(searchParams.get("dueDate") || "all");
      setOptimisticSort(searchParams.get("sort") || "dueDate");
      setOptimisticGroupBy(searchParams.get("groupBy") || "none");
    });
  }, [searchParams]);

  // Update URL when debounced search changes
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const currentQ = searchParamsRef.current.get("q") || "";

    // Don't search for queries under 3 chars (unless clearing an existing search)
    if (trimmed.length > 0 && trimmed.length < 3) {
      return;
    }

    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    // Only replace if the param actually changed
    if (trimmed !== currentQ) {
      lastPushedQ.current = trimmed;
      router.replace(`/tasks?${params.toString()}`);
    }
  }, [debouncedSearch, router]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      // Optimistic update (instant)
      if (key === "status") setOptimisticStatus(value);
      if (key === "priority") setOptimisticPriority(value);
      if (key === "category") setOptimisticCategory(value);
      if (key === "dueDate") setOptimisticDueDate(value);
      if (key === "sort") setOptimisticSort(value);
      if (key === "groupBy") setOptimisticGroupBy(value);

      // URL update (triggers server re-render)
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "none") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`/tasks?${params.toString()}`);
    },
    [router, searchParams]
  );

  const removeFilter = useCallback(
    (key: string) => {
      updateFilter(key, "all");
    },
    [updateFilter]
  );

  const clearFilters = useCallback(() => {
    // Clear optimistic state immediately
    setOptimisticStatus("all");
    setOptimisticPriority("all");
    setOptimisticCategory("all");
    setOptimisticDueDate("all");
    setOptimisticSort("dueDate");
    setOptimisticGroupBy("none");
    setSearchInput("");

    router.replace("/tasks");
  }, [router]);

  const hasFilters =
    optimisticStatus !== "all" ||
    optimisticPriority !== "all" ||
    optimisticCategory !== "all" ||
    optimisticDueDate !== "all" ||
    searchInput !== "";

  const hasSortOrGroup =
    optimisticSort !== "dueDate" ||
    optimisticGroupBy !== "none";

  // Build active filter chips
  const activeFilters: { key: string; label: string }[] = [];
  if (optimisticStatus !== "all") {
    activeFilters.push({ key: "status", label: `Status: ${statusLabels[optimisticStatus] ?? optimisticStatus}` });
  }
  if (optimisticPriority !== "all") {
    activeFilters.push({ key: "priority", label: `Priority: ${priorityLabels[optimisticPriority] ?? optimisticPriority}` });
  }
  if (optimisticCategory !== "all") {
    const cat = categories.find((c) => c.id === optimisticCategory);
    activeFilters.push({ key: "category", label: `Category: ${cat?.name ?? optimisticCategory}` });
  }
  if (optimisticDueDate !== "all") {
    activeFilters.push({ key: "dueDate", label: `Due: ${dueDateLabels[optimisticDueDate] ?? optimisticDueDate}` });
  }

  const activeFilterCount = activeFilters.length;

  const filterPopoverContent = (
    <div className="space-y-3">
      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <Select
          value={optimisticStatus}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Priority</label>
        <Select
          value={optimisticPriority}
          onValueChange={(value) => updateFilter("priority", value)}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select
            value={optimisticCategory}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || "#6B7280" }}
                  />
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Due Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Due Date</label>
        <Select
          value={optimisticDueDate}
          onValueChange={(value) => updateFilter("dueDate", value)}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {dueDateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search — always visible */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 pl-9 pr-9 text-sm"
          aria-label="Search tasks"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters popover — desktop */}
      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            {filterPopoverContent}
          </PopoverContent>
        </Popover>
      </div>

      {/* Filters sheet — mobile */}
      <div className="block sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-4 py-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{filterPopoverContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips — inline */}
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="h-7 gap-1 rounded-full text-xs"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => removeFilter(filter.key)}
            className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort — inline, always visible */}
      <div className="hidden sm:flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <Select
          value={optimisticSort}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger className="h-8 w-[130px] text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortFieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Group By — inline, always visible */}
      <div className="hidden sm:flex items-center gap-1">
        <Group className="h-3.5 w-3.5 text-muted-foreground" />
        <Select
          value={optimisticGroupBy}
          onValueChange={(value) => updateFilter("groupBy", value)}
        >
          <SelectTrigger className="h-8 w-[120px] text-sm">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile sort/group */}
      <div className="flex sm:hidden items-center gap-2 w-full">
        <Select
          value={optimisticSort}
          onValueChange={(value) => updateFilter("sort", value)}
        >
          <SelectTrigger className="h-9 flex-1 text-sm">
            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortFieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={optimisticGroupBy}
          onValueChange={(value) => updateFilter("groupBy", value)}
        >
          <SelectTrigger className="h-9 flex-1 text-sm">
            <Group className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset — only when non-default */}
      {(hasFilters || hasSortOrGroup) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
