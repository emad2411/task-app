import { CheckCircle2, Search } from "lucide-react"

const mockTasks = [
  {
    id: "1",
    title: "Review Q3 report",
    priority: "high",
    due: "Today",
  },
  {
    id: "2",
    title: "Email design team",
    priority: "medium",
    due: "Tomorrow",
  },
  {
    id: "3",
    title: "Update documentation",
    priority: "normal",
    due: "Next week",
  },
  {
    id: "4",
    title: "Prepare sprint review",
    priority: "high",
    due: "Today",
  },
]

export function DashboardPreview() {
  return (
    <div
      className="w-[320px] md:w-[280px] lg:w-[320px] rounded-lg border border-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden"
      role="img"
      aria-label="TaskFlow dashboard preview"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          <span className="text-xs font-semibold text-foreground">TaskFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="h-5 w-5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-14 border-r border-border p-2 flex flex-col items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Task list */}
        <div className="flex-1 p-3 space-y-2">
          {mockTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-sm border border-border flex-shrink-0" />
              <span className="text-xs text-foreground flex-1 truncate">{task.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  task.priority === "high"
                    ? "bg-brand/15 text-brand"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {task.priority}
              </span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{task.due}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
