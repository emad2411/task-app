import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockGetCurrentUserId = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getCurrentUserId: (...args: unknown[]) => mockGetCurrentUserId(...args),
}));

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
let mockWhereResolveValue: unknown = undefined;
const mockWhere = vi.fn(() => {
  const p = Promise.resolve(mockWhereResolveValue);
  (p as any).returning = mockReturning;
  return p;
});
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      tasks: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  tasks: {
    id: "id",
    userId: "userId",
    status: "status",
    priority: "priority",
    dueDate: "dueDate",
    categoryId: "categoryId",
    createdAt: "createdAt",
  },
  categories: {},
  TaskStatus: { todo: "todo", in_progress: "in_progress", done: "done", archived: "archived" },
  TaskPriority: { low: "low", medium: "medium", high: "high" },
}));

import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
  toggleTaskCompletionAction,
  archiveTaskAction,
} from "../task";

describe("createTaskAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await createTaskAction({ title: "My task" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should create a task and return success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    const mockTask = { id: "task-1", title: "My task", userId: "user-1" };
    mockReturning.mockResolvedValue([mockTask]);

    const result = await createTaskAction({ title: "My task" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTask);
  });

  it("should convert dueDate string to Date object", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", dueDate: "2025-12-31" });

    const values = mockValues.mock.calls[0][0];
    expect(values.dueDate).toBeInstanceOf(Date);
  });

  it("should set dueDate to null when not provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task" });

    const values = mockValues.mock.calls[0][0];
    expect(values.dueDate).toBeNull();
  });

  it("should set categoryId to null when empty string", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", categoryId: "" });

    const values = mockValues.mock.calls[0][0];
    expect(values.categoryId).toBeNull();
  });

  it("should return validation error for invalid input", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const result = await createTaskAction({});

    expect(result.success).toBe(false);
  });

  it("should return error for title over 200 characters", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const result = await createTaskAction({ title: "a".repeat(201) });

    expect(result.success).toBe(false);
  });

  it("should revalidate dashboard and tasks paths", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task" });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockRejectedValue(new Error("DB connection failed"));

    const result = await createTaskAction({ title: "Task" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB connection failed");
  });
});

describe("updateTaskAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should update a task and return success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    const mockTask = { id: "task-1", title: "Updated", userId: "user-1" };
    mockReturning.mockResolvedValue([mockTask]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockTask);
  });

  it("should return error when task not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Task not found");
  });

  it("should return validation error for invalid id", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");

    const result = await updateTaskAction({ id: "not-a-uuid", title: "Updated" });

    expect(result.success).toBe(false);
  });

  it("should revalidate task detail path", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    const taskId = "550e8400-e29b-41d4-a716-446655440000";
    mockReturning.mockResolvedValue([{ id: taskId }]);

    await updateTaskAction({ id: taskId, title: "Updated" });

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/tasks/${taskId}`);
  });

  it("should set updatedAt to current date", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.updatedAt).toBeInstanceOf(Date);
  });
});

describe("deleteTaskAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await deleteTaskAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should delete a task and return success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await deleteTaskAction("task-1");

    expect(result.success).toBe(true);
  });

  it("should return error when task not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([]);

    const result = await deleteTaskAction("nonexistent-task");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Task not found");
  });

  it("should revalidate dashboard and tasks paths", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await deleteTaskAction("task-1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockRejectedValue(new Error("DB error"));

    const result = await deleteTaskAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});

describe("toggleTaskCompletionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await toggleTaskCompletionAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should mark todo task as done", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue({ id: "task-1", status: "todo" });
    mockWhereResolveValue = undefined;

    const result = await toggleTaskCompletionAction("task-1");

    expect(result.success).toBe(true);
    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.status).toBe("done");
    expect(setCall.completedAt).toBeInstanceOf(Date);
  });

  it("should mark done task as todo", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue({ id: "task-1", status: "done" });
    mockWhereResolveValue = undefined;

    const result = await toggleTaskCompletionAction("task-1");

    expect(result.success).toBe(true);
    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.status).toBe("todo");
    expect(setCall.completedAt).toBeNull();
  });

  it("should return error when task not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue(null);

    const result = await toggleTaskCompletionAction("nonexistent");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Task not found");
  });

  it("should revalidate task detail path", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue({ id: "task-1", status: "todo" });
    mockWhereResolveValue = undefined;

    await toggleTaskCompletionAction("task-1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks/task-1");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockRejectedValue(new Error("Query failed"));

    const result = await toggleTaskCompletionAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Query failed");
  });
});

describe("archiveTaskAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await archiveTaskAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should archive a task and return success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1", status: "archived" }]);

    const result = await archiveTaskAction("task-1");

    expect(result.success).toBe(true);
    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.status).toBe("archived");
  });

  it("should return error when task not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([]);

    const result = await archiveTaskAction("nonexistent");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Task not found");
  });

  it("should revalidate task detail path", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await archiveTaskAction("task-1");

    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks/task-1");
  });

  it("should set updatedAt to current date", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await archiveTaskAction("task-1");

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.updatedAt).toBeInstanceOf(Date);
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockRejectedValue(new Error("Archive failed"));

    const result = await archiveTaskAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Archive failed");
  });
});
