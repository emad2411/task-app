import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
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
  (p as { returning: typeof mockReturning }).returning = mockReturning;
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

const mockGetUserTimezone = vi.fn().mockResolvedValue("UTC");
vi.mock("@/lib/data/preferences", () => ({
  getUserTimezone: (...args: unknown[]) => mockGetUserTimezone(...args),
}));

const mockGetCategoryById = vi.fn();
vi.mock("@/lib/data/category", () => ({
  getCategoryById: (...args: unknown[]) => mockGetCategoryById(...args),
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
    mockGetUserTimezone.mockResolvedValue("UTC");
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

  it("should store null description when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", description: null });

    const values = mockValues.mock.calls[0][0];
    expect(values.description).toBeNull();
  });

  it("should normalize empty string description to null", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", description: "" });

    const values = mockValues.mock.calls[0][0];
    expect(values.description).toBeNull();
  });

  it("should keep a non-empty description", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", description: "Notes" });

    const values = mockValues.mock.calls[0][0];
    expect(values.description).toBe("Notes");
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

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-tasks", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-dashboard", { expire: 0 });
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockRejectedValue(new Error("DB connection failed"));

    const result = await createTaskAction({ title: "Task" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create task. Please try again.");
  });

  it("should convert dueDate using the user's timezone (America/New_York)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("America/New_York");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", dueDate: "2025-12-31T16:00" });

    const values = mockValues.mock.calls[0][0];
    expect(values.dueDate).toBeInstanceOf(Date);
    // 16:00 NY (EST, UTC-5) = 21:00 UTC
    expect((values.dueDate as Date).toISOString()).toBe("2025-12-31T21:00:00.000Z");
  });

  it("should store null dueDate when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", dueDate: null });

    const values = mockValues.mock.calls[0][0];
    expect(values.dueDate).toBeNull();
  });

  it("should store null categoryId when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await createTaskAction({ title: "Task", categoryId: null });

    const values = mockValues.mock.calls[0][0];
    expect(values.categoryId).toBeNull();
  });

  describe("category ownership", () => {
    it("rejects a foreign categoryId with Invalid category and performs no insert", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockGetCategoryById.mockResolvedValue(null); // foreign / non-existent
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await createTaskAction({
        title: "Task",
        categoryId: "other-users-category",
      });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Invalid category");
      expect(mockValues).not.toHaveBeenCalled();
    });

    it("accepts the user's own categoryId", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockGetCategoryById.mockResolvedValue({ id: "cat-1", userId: "user-1" });
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await createTaskAction({
        title: "Task",
        categoryId: "cat-1",
      });

      expect(result.success).toBe(true);
      expect(mockValues.mock.calls[0][0].categoryId).toBe("cat-1");
    });

    it("skips the ownership check when categoryId is omitted", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await createTaskAction({ title: "Task" });

      expect(result.success).toBe(true);
      expect(mockGetCategoryById).not.toHaveBeenCalled();
    });
  });
});

describe("updateTaskAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserTimezone.mockResolvedValue("UTC");
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

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-tasks", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-dashboard", { expire: 0 });
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

  it("should clear an existing description when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
      description: null,
    });

    expect(result.success).toBe(true);
    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.description).toBeNull();
  });

  it("should normalize empty string description to null", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
      description: "",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.description).toBeNull();
  });

  it("should leave description unchanged when it is omitted", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.description).toBeUndefined();
  });

  it("should keep a non-empty description on update", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
      description: "Notes",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.description).toBe("Notes");
  });

  it("should convert dueDate using the user's timezone on update (Asia/Tokyo)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("Asia/Tokyo");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      dueDate: "2025-12-31T16:00",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.dueDate).toBeInstanceOf(Date);
    // 16:00 JST (UTC+9) = 07:00 UTC
    expect((setCall.dueDate as Date).toISOString()).toBe("2025-12-31T07:00:00.000Z");
  });

  it("should clear dueDate when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      dueDate: null,
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.dueDate).toBeNull();
  });

  it("should clear categoryId when null is provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      categoryId: null,
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.categoryId).toBeNull();
  });

  it("should leave dueDate unchanged when it is omitted", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.dueDate).toBeUndefined();
    expect(setCall.categoryId).toBeUndefined();
    expect(setCall.status).toBeUndefined();
    expect(setCall.priority).toBeUndefined();
    expect(setCall.description).toBeUndefined();
    expect(setCall.title).toBe("Updated");
    expect(setCall.updatedAt).toBeInstanceOf(Date);
  });

  it("should not reset status or priority to defaults when omitted", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall).not.toHaveProperty("status");
    expect(setCall).not.toHaveProperty("priority");
  });

  it("should set status when explicitly provided", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetUserTimezone.mockResolvedValue("UTC");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      status: "in_progress",
    });

    const setCall = mockSet.mock.calls[0][0];
    expect(setCall.status).toBe("in_progress");
  });

  describe("category ownership", () => {
    it("rejects a foreign categoryId with Invalid category and performs no update", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockGetUserTimezone.mockResolvedValue("UTC");
      mockGetCategoryById.mockResolvedValue(null); // foreign / non-existent
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await updateTaskAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated",
        categoryId: "other-users-category",
      });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBe("Invalid category");
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("accepts the user's own categoryId", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockGetUserTimezone.mockResolvedValue("UTC");
      mockGetCategoryById.mockResolvedValue({ id: "cat-1", userId: "user-1" });
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await updateTaskAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated",
        categoryId: "cat-1",
      });

      expect(result.success).toBe(true);
      expect(mockSet.mock.calls[0][0].categoryId).toBe("cat-1");
    });

    it("skips the ownership check when categoryId is omitted", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockGetUserTimezone.mockResolvedValue("UTC");
      mockReturning.mockResolvedValue([{ id: "task-1" }]);

      const result = await updateTaskAction({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Updated",
      });

      expect(result.success).toBe(true);
      expect(mockGetCategoryById).not.toHaveBeenCalled();
    });
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

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-tasks", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-dashboard", { expire: 0 });
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockRejectedValue(new Error("DB error"));

    const result = await deleteTaskAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to delete task. Please try again.");
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

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-tasks", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-dashboard", { expire: 0 });
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockRejectedValue(new Error("Query failed"));

    const result = await toggleTaskCompletionAction("task-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update task. Please try again.");
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

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-tasks", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-1-dashboard", { expire: 0 });
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
    expect(result.error).toBe("Failed to archive task. Please try again.");
  });
});
