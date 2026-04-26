"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export function EmptyState() {
  return (
    <Empty className="min-h-[400px] rounded-xl border bg-card p-8 shadow-sm">
      <EmptyMedia variant="icon">
        <ClipboardList className="size-4" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Welcome to TaskFlow!</EmptyTitle>
        <EmptyDescription>
          Start by creating your first task. TaskFlow helps you stay organized
          and on top of your deadlines.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="lg" asChild>
          <Link href="/tasks">Create Your First Task</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
