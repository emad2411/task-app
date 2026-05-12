import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
        <BarChart3 className="h-7 w-7 text-brand" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">
          Your command center awaits
        </h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Create your first task to unlock completion trends, velocity tracking,
          priority distribution, and category breakdowns.
        </p>
      </div>
      <Button asChild className="bg-brand text-background hover:bg-brand-deep">
        <Link href="/tasks">Create your first task</Link>
      </Button>
    </div>
  );
}
