import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <CheckSquare className="h-12 w-12" />
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}