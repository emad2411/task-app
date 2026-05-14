"use client";

import { useState } from "react";
import { TaskRow } from "./task-row";
import { TaskGroupHeader } from "./task-group-header";
import type { TaskStatus, TaskPriority } from "@/lib/db/schema";

interface GroupedTask {
  id: string;
  title: string;
  dueDate: Date | null;
  createdAt: Date;
  priority: TaskPriority;
  status: TaskStatus;
  category: {
    name: string;
    color: string | null;
  } | null;
}

interface TaskGroup {
  key: string;
  label: string;
  tasks: GroupedTask[];
}

interface GroupedTaskListProps {
  groups: TaskGroup[];
  timezone?: string;
}

export function GroupedTaskList({ groups, timezone }: GroupedTaskListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <>
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.key);

        return (
          <tbody key={group.key}>
            <TaskGroupHeader
              label={group.label}
              count={group.tasks.length}
              colSpan={7}
              collapsed={isCollapsed}
              onToggle={() => toggleGroup(group.key)}
            />
            {!isCollapsed &&
              group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  timezone={timezone}
                />
              ))}
          </tbody>
        );
      })}
    </>
  );
}
