import { describe, it, expect } from "vitest";
import { groupTasks } from "../task-grouping";
import type { TaskWithCategory } from "../task-grouping";

function createTask(overrides: Partial<TaskWithCategory> = {}): TaskWithCategory {
  return {
    id: "task-id",
    userId: "user-id",
    title: "Test Task",
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: null,
    category: null,
    ...overrides,
  };
}

const categoryWork = {
  id: "cat-work",
  userId: "user-id",
  name: "Work",
  color: "#ff0000",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const categoryPersonal = {
  id: "cat-personal",
  userId: "user-id",
  name: "Personal",
  color: "#00ff00",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("groupTasks", () => {
  it("should return empty array for empty tasks", () => {
    const result = groupTasks([], "status", "UTC");
    expect(result).toEqual([]);
  });

  it("should group by status in correct order", () => {
    const tasks = [
      createTask({ id: "1", status: "done" }),
      createTask({ id: "2", status: "todo" }),
      createTask({ id: "3", status: "in_progress" }),
      createTask({ id: "4", status: "todo" }),
    ];

    const result = groupTasks(tasks, "status", "UTC");
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("todo");
    expect(result[0].tasks).toHaveLength(2);
    expect(result[1].key).toBe("in_progress");
    expect(result[1].tasks).toHaveLength(1);
    expect(result[2].key).toBe("done");
    expect(result[2].tasks).toHaveLength(1);
  });

  it("should omit empty status groups", () => {
    const tasks = [createTask({ id: "1", status: "todo" })];
    const result = groupTasks(tasks, "status", "UTC");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("todo");
  });

  it("should group by category alphabetically", () => {
    const tasks = [
      createTask({ id: "1", category: categoryPersonal, categoryId: categoryPersonal.id }),
      createTask({ id: "2", category: categoryWork, categoryId: categoryWork.id }),
      createTask({ id: "3", category: categoryPersonal, categoryId: categoryPersonal.id }),
    ];

    const result = groupTasks(tasks, "category", "UTC");
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("cat-personal");
    expect(result[0].label).toBe("Personal");
    expect(result[0].tasks).toHaveLength(2);
    expect(result[1].key).toBe("cat-work");
    expect(result[1].label).toBe("Work");
    expect(result[1].tasks).toHaveLength(1);
  });

  it("should include uncategorized group for tasks without category", () => {
    const tasks = [
      createTask({ id: "1", category: categoryWork, categoryId: categoryWork.id }),
      createTask({ id: "2", category: null, categoryId: null }),
    ];

    const result = groupTasks(tasks, "category", "UTC");
    expect(result).toHaveLength(2);
    const uncategorized = result.find((g) => g.key === "uncategorized");
    expect(uncategorized).toBeDefined();
    expect(uncategorized?.label).toBe("Uncategorized");
    expect(uncategorized?.tasks).toHaveLength(1);
  });

  it("should group by due date buckets", () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = [
      createTask({ id: "1", dueDate: yesterday }),
      createTask({ id: "2", dueDate: now }),
      createTask({ id: "3", dueDate: tomorrow }),
      createTask({ id: "4", dueDate: null }),
    ];

    const result = groupTasks(tasks, "dueDate", "UTC");
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Should contain relevant buckets (exact buckets depend on time of day)
    const keys = result.map((g) => g.key);
    expect(keys).toContain("overdue");
    expect(keys).toContain("no_due_date");
  });

  it("should preserve task order within groups", () => {
    const tasks = [
      createTask({ id: "1", status: "todo", priority: "high" }),
      createTask({ id: "2", status: "todo", priority: "low" }),
      createTask({ id: "3", status: "todo", priority: "medium" }),
    ];

    const result = groupTasks(tasks, "status", "UTC");
    expect(result[0].tasks).toHaveLength(3);
    expect(result[0].tasks[0].id).toBe("1");
    expect(result[0].tasks[1].id).toBe("2");
    expect(result[0].tasks[2].id).toBe("3");
  });
});
