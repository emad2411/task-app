import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCategoriesFindMany = vi.fn();
const mockWhere = vi.fn(() => Promise.resolve([{ count: 5 }]));
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      tasks: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
      categories: {
        findMany: (...args: unknown[]) => mockCategoriesFindMany(...args),
      },
    },
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  tasks: {
    id: "id",
    userId: "userId",
    status: "status",
    priority: "priority",
    dueDate: "dueDate",
    completedAt: "completedAt",
    title: "title",
    description: "description",
    categoryId: "categoryId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  categories: { id: "id", name: "name", userId: "userId" },
}));

vi.mock("@/lib/utils/date", () => ({
  getStartOfTodayInTimezone: vi.fn(() => new Date("2026-04-27T00:00:00Z")),
  getEndOfTodayInTimezone: vi.fn(() => new Date("2026-04-27T23:59:59Z")),
}));

import { getTasks, getTaskById, getTaskCount, getCategoriesForUser } from "../task";

describe("getTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user's tasks", async () => {
    const mockTasks = [
      { id: "task-1", title: "Task 1", userId: "user-123", category: null },
    ];
    mockFindMany.mockResolvedValue(mockTasks);

    const result = await getTasks("user-123");

    expect(result).toEqual(mockTasks);
  });

  it("should return empty array for user with no tasks", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getTasks("user-123");

    expect(result).toEqual([]);
  });

  it("should accept filter options", async () => {
    mockFindMany.mockResolvedValue([]);

    await getTasks("user-123", {
      status: "todo",
      priority: "high",
    });

    expect(mockFindMany).toHaveBeenCalled();
  });

  it("should accept sort options", async () => {
    mockFindMany.mockResolvedValue([]);

    await getTasks("user-123", {
      sortField: "title",
      sortOrder: "asc",
    });

    expect(mockFindMany).toHaveBeenCalled();
  });

  it("should accept search option", async () => {
    mockFindMany.mockResolvedValue([]);

    await getTasks("user-123", { search: "test" });

    expect(mockFindMany).toHaveBeenCalled();
  });

  it("should accept due date filter", async () => {
    mockFindMany.mockResolvedValue([]);

    await getTasks("user-123", { dueDate: "overdue" });

    expect(mockFindMany).toHaveBeenCalled();
  });

  it("should accept timezone parameter", async () => {
    mockFindMany.mockResolvedValue([]);

    await getTasks("user-123", { dueDate: "today" }, "Asia/Tokyo");

    expect(mockFindMany).toHaveBeenCalled();
  });
});

describe("getTaskById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return task scoped to user", async () => {
    const mockTask = {
      id: "task-1",
      title: "Task 1",
      userId: "user-123",
      category: null,
    };
    mockFindFirst.mockResolvedValue(mockTask);

    const result = await getTaskById("user-123", "task-1");

    expect(result).toEqual(mockTask);
  });

  it("should return null when task not found", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    const result = await getTaskById("user-123", "nonexistent");

    expect(result).toBeNull();
  });
});

describe("getTaskCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return task count", async () => {
    const result = await getTaskCount("user-123");

    expect(result).toBe(5);
  });
});

describe("getCategoriesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user's categories", async () => {
    const mockCategories = [{ id: "cat-1", name: "Work" }];
    mockCategoriesFindMany.mockResolvedValue(mockCategories);

    const result = await getCategoriesForUser("user-123");

    expect(result).toEqual(mockCategories);
  });
});
