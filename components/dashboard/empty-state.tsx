"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border bg-card p-8 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ClipboardList className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Welcome to TaskFlow!</h2>
        <p className="text-muted-foreground max-w-md">
          Start by creating your first task. TaskFlow helps you stay organized
          and on top of your deadlines.
        </p>
      </div>

      <Button size="lg" asChild>
        <Link href="/tasks">Create Your First Task</Link>
      </Button>
    </div>
  );
}
