import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      categories: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  categories: { id: "id", userId: "userId", name: "name" },
}));

import { getCategories, getCategoryById, getCategoriesForUser } from "../category";

describe("getCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user's categories", async () => {
    const mockCategories = [
      { id: "cat-1", name: "Work", userId: "user-123" },
      { id: "cat-2", name: "Personal", userId: "user-123" },
    ];
    mockFindMany.mockResolvedValue(mockCategories);

    const result = await getCategories("user-123");

    expect(result).toEqual(mockCategories);
    expect(result).toHaveLength(2);
  });

  it("should return empty array for user with no categories", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getCategories("user-123");

    expect(result).toEqual([]);
  });

  it("should scope to userId", async () => {
    mockFindMany.mockResolvedValue([]);

    await getCategories("user-456");

    expect(mockFindMany).toHaveBeenCalled();
  });
});

describe("getCategoryById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return category scoped to user", async () => {
    const mockCategory = { id: "cat-1", name: "Work", userId: "user-123" };
    mockFindFirst.mockResolvedValue(mockCategory);

    const result = await getCategoryById("user-123", "cat-1");

    expect(result).toEqual(mockCategory);
  });

  it("should return null when category not found", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    const result = await getCategoryById("user-123", "nonexistent");

    expect(result).toBeNull();
  });

  it("should return null when category belongs to another user", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    const result = await getCategoryById("user-123", "other-user-cat");

    expect(result).toBeNull();
  });
});

describe("getCategoriesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user's categories", async () => {
    const mockCategories = [
      { id: "cat-1", name: "Work", userId: "user-123" },
    ];
    mockFindMany.mockResolvedValue(mockCategories);

    const result = await getCategoriesForUser("user-123");

    expect(result).toEqual(mockCategories);
  });

  it("should return empty array for no categories", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getCategoriesForUser("user-123");

    expect(result).toEqual([]);
  });
});
