"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import { cn } from "@/lib/utils";
import { Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "@/lib/db/schema";
import type { Category } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils/date";

const titleSchema = z.string().min(1, "Title is required").max(200);
const descriptionSchema = z.string().max(2000).optional();
const statusSchema = z.enum(["todo", "in_progress", "done", "archived"]);
const prioritySchema = z.enum(["low", "medium", "high"]);
const dueDateSchema = z.string().optional();

type TaskForEdit = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  categoryId: string | null;
};

// Shared hook for inline edit state
function useInlineEdit() {
  const [editingField, setEditingField] = useState<string | null>(null);
  const startEdit = useCallback((field: string) => setEditingField(field), []);
  const stopEdit = useCallback(() => setEditingField(null), []);
  return { editingField, startEdit, stopEdit, isEditing: editingField !== null };
}

// Pencil icon that appears on hover
function EditHint({ visible }: { visible: boolean }) {
  return (
    <Pencil
      className={cn(
        "size-3 text-muted-foreground/40 transition-opacity shrink-0",
        visible ? "opacity-100" : "opacity-0"
      )}
    />
  );
}

// ─── Inline Title Edit ───────────────────────────────────────────────

export function InlineTitleEdit({
  task,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  className,
  isDone,
}: {
  task: TaskForEdit;
  onSave: (data: Partial<TaskForEdit>) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  className?: string;
  isDone?: boolean;
}) {
  const isEditing = editField === "title";
  const [value, setValue] = useState(task.title);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleSave() {
    const parsed = titleSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (parsed.data === task.title) {
      onStopEdit();
      return;
    }
    setError(null);
    startTransition(async () => {
      const ok = await onSave({ title: parsed.data });
      if (ok) onStopEdit();
    });
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          maxLength={200}
          disabled={isPending}
          aria-invalid={!!error}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setValue(task.title);
              setError(null);
              onStopEdit();
            }
          }}
          onBlur={handleSave}
          className={cn(
            "h-auto border-0 bg-transparent px-0 text-xl lg:text-2xl font-bold tracking-tight focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-brand/50",
            isDone && "line-through opacity-60"
          )}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Saving...
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-md px-1 -mx-1 py-0.5 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("title")}
      role="button"
      tabIndex={0}
      aria-label="Edit title"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("title");
        }
      }}
    >
      <h1
        className={cn(
          "flex-1 text-xl lg:text-2xl font-bold tracking-tight text-foreground truncate",
          isDone && "line-through opacity-60"
        )}
      >
        {task.title}
      </h1>
      <EditHint visible />
    </div>
  );
}

// ─── Inline Textarea Edit (Description) ──────────────────────────────

export function InlineDescriptionEdit({
  task,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  className,
}: {
  task: TaskForEdit;
  onSave: (data: Partial<TaskForEdit>) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  className?: string;
}) {
  const isEditing = editField === "description";
  const [value, setValue] = useState(task.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  function handleSave() {
    const parsed = descriptionSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const newVal = parsed.data ?? "";
    if (newVal === (task.description ?? "")) {
      onStopEdit();
      return;
    }
    setError(null);
    startTransition(async () => {
      const ok = await onSave({ description: newVal || null });
      if (ok) onStopEdit();
    });
  }

  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          maxLength={2000}
          disabled={isPending}
          aria-invalid={!!error}
          rows={4}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setValue(task.description ?? "");
              setError(null);
              onStopEdit();
            }
          }}
          onBlur={handleSave}
          placeholder="Add a description..."
          className="bg-transparent focus-visible:ring-0 focus-visible:border-brand/50"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{value.length}/2000</span>
          <span>Esc to cancel</span>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Saving...
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-start gap-2 rounded-md px-1 -mx-1 py-1 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("description")}
      role="button"
      tabIndex={0}
      aria-label="Edit description"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("description");
        }
      }}
    >
      <p
        className={cn(
          "flex-1 text-base leading-relaxed text-foreground whitespace-pre-wrap break-words",
          !task.description && "text-muted-foreground italic"
        )}
      >
        {task.description || "Add a description..."}
      </p>
      <EditHint visible />
    </div>
  );
}

// ─── Inline Status Select ────────────────────────────────────────────

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-brand/15 text-brand",
  done: "bg-brand/25 text-brand-deep",
  archived: "bg-muted text-muted-foreground",
};

export function InlineStatusEdit({
  task,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  className,
}: {
  task: TaskForEdit;
  onSave: (data: Partial<TaskForEdit>) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  className?: string;
}) {
  const isEditing = editField === "status";
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const parsed = statusSchema.safeParse(value);
    if (!parsed.success) return;
    if (parsed.data === task.status) {
      onStopEdit();
      return;
    }
    startTransition(async () => {
      const ok = await onSave({ status: parsed.data });
      if (ok) onStopEdit();
    });
  }

  const current = statusOptions.find((o) => o.value === task.status);

  if (isEditing) {
    return (
      <Select
        value={task.status}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (!open) onStopEdit();
        }}
        disabled={isPending}
        open
      >
        <SelectTrigger
          size="sm"
          className="w-auto border-0 bg-transparent focus:ring-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("status")}
      role="button"
      tabIndex={0}
      aria-label="Change status"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("status");
        }
      }}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
          statusColors[task.status]
        )}
      >
        {current?.label}
      </span>
      <EditHint visible />
    </div>
  );
}

// ─── Inline Priority Select ──────────────────────────────────────────

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  high: "bg-destructive/15 text-destructive",
};

export function InlinePriorityEdit({
  task,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  className,
}: {
  task: TaskForEdit;
  onSave: (data: Partial<TaskForEdit>) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  className?: string;
}) {
  const isEditing = editField === "priority";
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const parsed = prioritySchema.safeParse(value);
    if (!parsed.success) return;
    if (parsed.data === task.priority) {
      onStopEdit();
      return;
    }
    startTransition(async () => {
      const ok = await onSave({ priority: parsed.data });
      if (ok) onStopEdit();
    });
  }

  const current = priorityOptions.find((o) => o.value === task.priority);

  if (isEditing) {
    return (
      <Select
        value={task.priority}
        onValueChange={handleChange}
        onOpenChange={(open) => {
          if (!open) onStopEdit();
        }}
        disabled={isPending}
        open
      >
        <SelectTrigger
          size="sm"
          className="w-auto border-0 bg-transparent focus:ring-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("priority")}
      role="button"
      tabIndex={0}
      aria-label="Change priority"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("priority");
        }
      }}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
          priorityColors[task.priority]
        )}
      >
        {current?.label}
      </span>
      <EditHint visible />
    </div>
  );
}

// ─── Inline Due Date Edit ────────────────────────────────────────────

export function InlineDueDateEdit({
  task,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  timezone = "UTC",
  isOverdue,
  isDueToday,
  className,
}: {
  task: TaskForEdit;
  onSave: (data: { dueDate?: string | null }) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  timezone?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
  className?: string;
}) {
  const isEditing = editField === "dueDate";
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  }, [isEditing]);

  function handleSave(dateStr: string) {
    const parsed = dueDateSchema.safeParse(dateStr);
    if (!parsed.success) return;
    startTransition(async () => {
      const ok = await onSave({ dueDate: parsed.data || null });
      if (ok) onStopEdit();
    });
  }

  const dateValue = task.dueDate
    ? new Date(
        task.dueDate.getTime() - task.dueDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)
    : "";

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="datetime-local"
        defaultValue={dateValue}
        onChange={(e) => handleSave(e.target.value)}
        onBlur={() => onStopEdit()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onStopEdit();
        }}
        disabled={isPending}
        className="h-7 w-auto text-xs"
      />
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("dueDate")}
      role="button"
      tabIndex={0}
      aria-label="Set due date"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("dueDate");
        }
      }}
    >
      <span
        className={cn(
          "text-sm",
          isOverdue && "text-destructive font-medium",
          isDueToday && "text-brand font-medium",
          !task.dueDate && "text-muted-foreground italic",
          !isOverdue && !isDueToday && task.dueDate && "text-foreground"
        )}
      >
        {task.dueDate
          ? formatDate(task.dueDate, "MMM dd, yyyy", timezone)
          : "Set due date"}
        {isDueToday && " (Today)"}
        {isOverdue && " (Overdue)"}
      </span>
      <EditHint visible />
    </div>
  );
}

// ─── Inline Category Edit ────────────────────────────────────────────

export function InlineCategoryEdit({
  task,
  categories,
  categoryDisplay,
  onSave,
  editField,
  onStartEdit,
  onStopEdit,
  className,
}: {
  task: TaskForEdit;
  categories: Category[];
  categoryDisplay: { name: string; color: string | null } | null;
  onSave: (data: Partial<TaskForEdit>) => Promise<boolean>;
  editField: string | null;
  onStartEdit: (field: string) => void;
  onStopEdit: () => void;
  className?: string;
}) {
  const isEditing = editField === "category";
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(categoryId: string | null) {
    if (categoryId === task.categoryId) {
      onStopEdit();
      return;
    }
    startTransition(async () => {
      const ok = await onSave({ categoryId });
      if (ok) {
        onStopEdit();
        setSearch("");
      }
    });
  }

  if (isEditing) {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="h-7 text-xs mb-1"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onStopEdit();
              setSearch("");
            }
          }}
        />
        <div className="absolute z-50 mt-1 max-h-48 w-56 overflow-auto rounded-lg bg-popover shadow-md ring-1 ring-foreground/10">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(null);
            }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
            No category
          </button>
          {filtered.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                cat.id === task.categoryId && "bg-accent/50"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(cat.id);
              }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.color || "#6b7280" }}
              />
              {cat.name}
              {cat.id === task.categoryId && (
                <Check className="ml-auto size-3 text-brand" />
              )}
            </button>
          ))}
          {filtered.length === 0 && search && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No matches
            </div>
          )}
        </div>
        {isPending && (
          <p className="text-xs text-muted-foreground animate-pulse mt-1">
            Saving...
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted/40",
        className
      )}
      onClick={() => onStartEdit("category")}
      role="button"
      tabIndex={0}
      aria-label="Set category"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit("category");
        }
      }}
    >
      {categoryDisplay ? (
        <>
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: categoryDisplay.color || "#6b7280" }}
          />
          <span className="text-sm text-foreground">
            {categoryDisplay.name}
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground italic">
          Set category
        </span>
      )}
      <EditHint visible />
    </div>
  );
}

export { useInlineEdit };
