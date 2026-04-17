import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <LayoutDashboard className="h-12 w-12" />
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}