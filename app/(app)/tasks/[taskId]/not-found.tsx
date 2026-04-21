import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TaskNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Task not found</h2>
        <p className="text-muted-foreground">
          The task you are looking for does not exist or you do not have access to it.
        </p>
        <Button asChild>
          <Link href="/tasks">Back to tasks</Link>
        </Button>
      </main>
    </div>
  );
}
