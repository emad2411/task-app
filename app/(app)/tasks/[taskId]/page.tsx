import { FileText } from "lucide-react";

export default function TaskDetailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <FileText className="h-12 w-12" />
      <h1 className="text-2xl font-semibold">Task Detail</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}