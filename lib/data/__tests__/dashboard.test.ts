import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockGroupBy = vi.fn(() => Promise.resolve([]));

function makeWhereResult(overrides?: Partial<{ count: number }>) {
  const promise = Promise.resolve([{ count: overrides?.count ?? 0 }]) as Promise<unknown[]>;
  (promise as Promise<unknown[]> & { groupBy: typeof mockGroupBy }).groupBy = mockGroupBy;
  return promise;
}

const mockSelectWhere = vi.fn(() => makeWhereResult());
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      userPreferences: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
      tasks: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
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
    categoryId: "categoryId",
  },
  userPreferences: { userId: "userId" },
  TaskStatus: { todo: "todo" },
  TaskPriority: { low: "low", medium: "medium", high: "high" },
}));

vi.mock("@/lib/utils/date", () => ({
  getStartOfTodayInTimezone: vi.fn(() => new Date("2026-04-27T00:00:00Z")),
  getEndOfTodayInTimezone: vi.fn(() => new Date("2026-04-27T23:59:59Z")),
  getUpcomingThreshold: vi.fn(() => new Date("2026-05-04T00:00:00Z")),
}));

import { getDashboardData } from "../dashboard";

describe("getDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({ timezone: "UTC" });
  });

  it("should return dashboard data with correct structure", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getDashboardData("user-123");

    expect(result).toHaveProperty("stats");
    expect(result).toHaveProperty("priorityDistribution");
    expect(result).toHaveProperty("upcomingTasks");
    expect(result).toHaveProperty("timezone");
  });

  it("should return zero counts when no tasks exist", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getDashboardData("user-123");

    expect(result.stats.dueToday).toBe(0);
    expect(result.stats.overdue).toBe(0);
    expect(result.stats.completedToday).toBe(0);
    expect(result.stats.totalActive).toBe(0);
    expect(result.priorityDistribution).toEqual({
      high: 0,
      medium: 0,
      low: 0,
    });
    expect(result.upcomingTasks).toEqual([]);
  });

  it("should return correct timezone from preferences", async () => {
    mockFindFirst.mockResolvedValue({ timezone: "America/New_York" });
    mockFindMany.mockResolvedValue([]);

    const result = await getDashboardData("user-123");

    expect(result.timezone).toBe("America/New_York");
  });

  it("should fall back to UTC when no preferences exist", async () => {
    mockFindFirst.mockResolvedValue(undefined);
    mockFindMany.mockResolvedValue([]);

    const result = await getDashboardData("user-123");

    expect(result.timezone).toBe("UTC");
  });

  it("should handle priority distribution with mixed values", async () => {
    mockFindMany.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([
      { priority: "high", count: 2 },
      { priority: "low", count: 5 },
    ]);

    const result = await getDashboardData("user-123");

    expect(result.priorityDistribution.high).toBe(2);
    expect(result.priorityDistribution.medium).toBe(0);
    expect(result.priorityDistribution.low).toBe(5);
  });
});
