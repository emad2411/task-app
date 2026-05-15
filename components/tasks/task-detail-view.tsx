"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Archive,
  Trash2,
  Pencil,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { ArchiveTaskDialog } from "./archive-task-dialog";
import {
  updateTaskAction,
  toggleTaskCompletionAction,
} from "@/lib/actions/task";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";
import type { Category } from "@/lib/db/schema";
import { isDueToday, isOverdue, formatDate } from "@/lib/utils/date";
import {
  InlineTitleEdit,
  InlineDescriptionEdit,
  InlineStatusEdit,
  InlinePriorityEdit,
  InlineDueDateEdit,
  InlineCategoryEdit,
} from "./inline-edit";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { TaskActivityTimeline } from "./task-activity-timeline";

interface TaskDetailViewProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: {
      name: string;
      color: string | null;
    } | null;
    categoryId: string | null;
  };
  categories: Category[];
  timezone?: string;
}

export function TaskDetailView({
  task,
  categories,
  timezone = "UTC",
}: TaskDetailViewProps) {
  const router = useRouter();
  const [editField, setEditField] = useState<string | null>(null);
  const [isTogglePending, startToggleTransition] = useTransition();
  const done = task.status === "done";
  const taskIsDueToday = isDueToday(task.dueDate, timezone);
  const taskIsOverdue = isOverdue(task.dueDate, timezone);

  const startEdit = useCallback((field: string) => setEditField(field), []);
  const stopEdit = useCallback(() => setEditField(null), []);

  const handleInlineSave = useCallback(
    async (data: Record<string, unknown>): Promise<boolean> => {
      const dueDate =
        data.dueDate !== undefined
          ? (data.dueDate as string | null) ?? ""
          : task.dueDate
            ? task.dueDate.toISOString().slice(0, 16)
            : "";

      const result = await updateTaskAction({
        id: task.id,
        title: (data.title as string) ?? task.title,
        description:
          data.description !== undefined
            ? (data.description as string | null)
            : task.description,
        status: (data.status as TaskStatus) ?? task.status,
        priority: (data.priority as TaskPriority) ?? task.priority,
        dueDate,
        categoryId:
          data.categoryId !== undefined
            ? (data.categoryId as string | null) ?? ""
            : task.categoryId ?? "",
      });

      if (result.success) {
        toast.success("Task updated");
        return true;
      }
      toast.error(result.error || "Failed to update");
      return false;
    },
    [task]
  );

  function handleToggle() {
    startToggleTransition(async () => {
      const result = await toggleTaskCompletionAction(task.id);
      if (result.success) {
        toast.success(done ? "Task reopened" : "Task completed");
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <Link href="/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tasks
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <EditTaskDialog
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              categoryId: task.categoryId,
            }}
            categories={categories}
          >
            <Button variant="outline" size="sm" className="h-8">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">All fields</span>
            </Button>
          </EditTaskDialog>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
        {/* Main content */}
        <div className="space-y-6 min-w-0">
          {/* Title */}
          <InlineTitleEdit
            task={task}
            onSave={handleInlineSave}
            editField={editField}
            onStartEdit={startEdit}
            onStopEdit={stopEdit}
            isDone={done}
          />

          {/* Status + Priority row (view-only) */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span
                className={cn(
                  "text-xs",
                  taskIsOverdue && "text-destructive font-medium",
                  taskIsDueToday && "text-brand font-medium",
                  !taskIsOverdue && !taskIsDueToday && "text-muted-foreground"
                )}
              >
                {taskIsDueToday
                  ? "Due today"
                  : taskIsOverdue
                    ? "Overdue"
                    : `Due ${formatDate(task.dueDate, "MMM dd", timezone)}`}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="border-t border-border pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Description
            </h2>
            <InlineDescriptionEdit
              task={task}
              onSave={handleInlineSave}
              editField={editField}
              onStartEdit={startEdit}
              onStopEdit={stopEdit}
            />
          </div>

          {/* Activity timeline */}
          <div className="border-t border-border pt-6">
            <TaskActivityTimeline
              task={task}
              timezone={timezone}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Metadata fields */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h2>

            {/* Due date */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Due date</label>
              <InlineDueDateEdit
                task={task}
                onSave={handleInlineSave}
                editField={editField}
                onStartEdit={startEdit}
                onStopEdit={stopEdit}
                timezone={timezone}
                isOverdue={taskIsOverdue}
                isDueToday={taskIsDueToday}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <InlineCategoryEdit
                task={task}
                categories={categories}
                categoryDisplay={task.category}
                onSave={handleInlineSave}
                editField={editField}
                onStartEdit={startEdit}
                onStopEdit={stopEdit}
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <InlineStatusEdit
                task={task}
                onSave={handleInlineSave}
                editField={editField}
                onStartEdit={startEdit}
                onStopEdit={stopEdit}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Priority</label>
              <InlinePriorityEdit
                task={task}
                onSave={handleInlineSave}
                editField={editField}
                onStartEdit={startEdit}
                onStopEdit={stopEdit}
              />
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">
                {formatDate(task.createdAt, "MMM dd, yyyy", timezone)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-foreground">
                {formatDate(task.updatedAt, "MMM dd, yyyy", timezone)}
              </span>
            </div>
            {task.completedAt && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Completed</span>
                <span className="text-brand">
                  {formatDate(task.completedAt, "MMM dd, yyyy", timezone)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-4 space-y-2">
            <Button
              variant={done ? "outline" : "default"}
              onClick={handleToggle}
              disabled={isTogglePending}
              className={cn(
                "w-full h-9",
                !done &&
                  "bg-brand/15 text-brand border-brand/30 hover:bg-brand/25 hover:text-brand"
              )}
            >
              {done ? (
                <>
                  <Circle className="mr-2 h-4 w-4" />
                  Reopen task
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark complete
                </>
              )}
            </Button>

            {task.status !== "archived" && (
              <ArchiveTaskDialog taskId={task.id}>
                <Button variant="outline" className="w-full h-9">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </ArchiveTaskDialog>
            )}

            <DeleteTaskDialog
              taskId={task.id}
              taskTitle={task.title}
              onDeleted={() => router.push("/tasks")}
            >
              <Button variant="outline" className="w-full h-9 text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DeleteTaskDialog>
          </div>
        </aside>
      </div>
    </div>
  );
}
