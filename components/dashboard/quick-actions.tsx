"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Tags } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href="/tasks">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Link>
      </Button>

      <Button variant="outline" asChild>
        <Link href="/tasks">
          <ListTodo className="mr-2 h-4 w-4" />
          View All Tasks
        </Link>
      </Button>

      <Button variant="outline" asChild>
        <Link href="/categories">
          <Tags className="mr-2 h-4 w-4" />
          Manage Categories
        </Link>
      </Button>
    </div>
  );
}
