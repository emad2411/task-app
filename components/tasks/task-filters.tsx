"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowUpDown, Group, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const dueDateOptions = [
  { value: "all", label: "All Dates" },
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

const sortOrderOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

const groupByOptions = [
  { value: "none", label: "None" },
  { value: "status", label: "Status" },
  { value: "category", label: "Category" },
  { value: "dueDate", label: "Due Date" },
];

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

  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const category = searchParams.get("category") || "all";
  const dueDate = searchParams.get("dueDate") || "all";
  const sort = searchParams.get("sort") || "dueDate";
  const order = searchParams.get("order") || "asc";
  const groupBy = searchParams.get("groupBy") || "none";
  const q = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch.trim()) {
      params.set("q", debouncedSearch.trim());
    } else {
      params.delete("q");
    }
    // Only replace if the param actually changed
    const currentQ = searchParams.get("q") || "";
    if (debouncedSearch.trim() !== currentQ) {
      router.replace(`/tasks?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
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

  const clearFilters = useCallback(() => {
    router.replace("/tasks");
  }, [router]);

  const hasFilters =
    status !== "all" ||
    priority !== "all" ||
    category !== "all" ||
    dueDate !== "all" ||
    q !== "";

  const hasSortOrGroup = sort !== "dueDate" || order !== "asc" || groupBy !== "none";

  const filterContent = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 pl-9 pr-10 text-base md:h-8 md:text-sm"
            aria-label="Search tasks"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status */}
          <Select value={status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="h-11 w-full text-base sm:w-[140px] md:h-8 md:text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select value={priority} onValueChange={(value) => updateFilter("priority", value)}>
          <SelectTrigger className="h-11 w-full text-base sm:w-[140px] md:h-8 md:text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        {categories.length > 0 && (
          <Select value={category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="h-11 w-full text-base sm:w-[160px] md:h-8 md:text-sm">
              <SelectValue placeholder="Category" />
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
        )}

        {/* Due Date */}
        <Select value={dueDate} onValueChange={(value) => updateFilter("dueDate", value)}>
          <SelectTrigger className="h-11 w-full text-base sm:w-[150px] md:h-8 md:text-sm">
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent>
            {dueDateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Field */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sort} onValueChange={(value) => updateFilter("sort", value)}>
            <SelectTrigger className="h-11 w-full text-base sm:w-[140px] md:h-8 md:text-sm">
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

        {/* Sort Order */}
        <Select value={order} onValueChange={(value) => updateFilter("order", value)}>
          <SelectTrigger className="h-11 w-full text-base sm:w-[120px] md:h-8 md:text-sm">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            {sortOrderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Group By */}
        <div className="flex items-center gap-1">
          <Group className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={groupBy} onValueChange={(value) => updateFilter("groupBy", value)}>
            <SelectTrigger className="h-11 w-full text-base sm:w-[130px] md:h-8 md:text-sm">
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

        {/* Clear filters */}
        {(hasFilters || hasSortOrGroup) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-11 md:h-8">
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-2">
      {/* Desktop: inline filters */}
      <div className="hidden sm:block">{filterContent}</div>

      {/* Mobile: collapsible sheet */}
      <div className="block sm:hidden">
        <div className="flex flex-col gap-2">
          {/* Search always visible on mobile */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 pl-9 pr-8 text-base md:h-9 md:text-sm"
              aria-label="Search tasks"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-11 flex-1 md:h-8">
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                  Filters
                  {hasFilters && (
                    <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto px-4 py-6">
                <SheetHeader className="px-0">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">{filterContent}</div>
              </SheetContent>
            </Sheet>

            {/* Quick sort/group on mobile */}
            <Select value={sort} onValueChange={(value) => updateFilter("sort", value)}>
              <SelectTrigger className="h-11 flex-1 text-base md:h-8 md:text-sm">
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

            <Select value={groupBy} onValueChange={(value) => updateFilter("groupBy", value)}>
              <SelectTrigger className="h-11 flex-1 text-base md:h-8 md:text-sm">
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
        </div>
      </div>
    </div>
  );
}
