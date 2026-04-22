import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskSchema } from "../task";

describe("createTaskSchema", () => {
  it("should validate a minimal valid task", () => {
    const result = createTaskSchema.parse({ title: "My task" });
    expect(result.title).toBe("My task");
    expect(result.status).toBe("todo");
    expect(result.priority).toBe("medium");
    expect(result.description).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
    expect(result.categoryId).toBeUndefined();
  });

  it("should validate a full valid task", () => {
    const result = createTaskSchema.parse({
      title: "My task",
      description: "A description",
      status: "in_progress",
      priority: "high",
      dueDate: "2025-12-31",
      categoryId: "cat-123",
    });
    expect(result).toEqual({
      title: "My task",
      description: "A description",
      status: "in_progress",
      priority: "high",
      dueDate: "2025-12-31",
      categoryId: "cat-123",
    });
  });

  it("should reject empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("should reject missing title", () => {
    const result = createTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject title over 200 characters", () => {
    const result = createTaskSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("should allow title at exactly 200 characters", () => {
    const result = createTaskSchema.safeParse({ title: "a".repeat(200) });
    expect(result.success).toBe(true);
  });

  it("should reject description over 2000 characters", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should allow description at exactly 2000 characters", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      description: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid status", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid statuses", () => {
    const statuses = ["todo", "in_progress", "done", "archived"] as const;
    for (const status of statuses) {
      const result = createTaskSchema.safeParse({ title: "Task", status });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid priority", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid priorities", () => {
    const priorities = ["low", "medium", "high"] as const;
    for (const priority of priorities) {
      const result = createTaskSchema.safeParse({ title: "Task", priority });
      expect(result.success).toBe(true);
    }
  });

  it("should accept empty string for dueDate and convert to undefined", () => {
    const result = createTaskSchema.safeParse({ title: "Task", dueDate: "" });
    expect(result.success).toBe(true);
  });

  it("should accept empty string for categoryId", () => {
    const result = createTaskSchema.safeParse({ title: "Task", categoryId: "" });
    expect(result.success).toBe(true);
  });

  it("should default status to todo", () => {
    const result = createTaskSchema.parse({ title: "Task" });
    expect(result.status).toBe("todo");
  });

  it("should default priority to medium", () => {
    const result = createTaskSchema.parse({ title: "Task" });
    expect(result.priority).toBe("medium");
  });
});

describe("updateTaskSchema", () => {
  it("should validate with valid id and fields", () => {
    const result = updateTaskSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated task",
    });
    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.title).toBe("Updated task");
  });

  it("should reject missing id", () => {
    const result = updateTaskSchema.safeParse({ title: "Updated task" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid uuid id", () => {
    const result = updateTaskSchema.safeParse({
      id: "not-a-uuid",
      title: "Updated task",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty title when provided", () => {
    const result = updateTaskSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("should inherit all createTaskSchema validations", () => {
    const result = updateTaskSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
