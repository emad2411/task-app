import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidateTag = vi.fn();
const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockGetCurrentUserId = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getCurrentUserId: (...args: unknown[]) => mockGetCurrentUserId(...args),
}));

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
const mockWhere = vi.fn(() => ({ returning: mockReturning }));
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
    query: {
      categories: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  categories: {
    id: "id",
    userId: "userId",
    name: "name",
    color: "color",
  },
  tasks: {},
}));

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../category";

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should create category with valid input", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    const mockCategory = { id: "cat-1", name: "Work", userId: "user-123" };
    mockReturning.mockResolvedValue([mockCategory]);

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCategory);
  });

  it("should reject duplicate name", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue({ id: "existing", name: "Work" });

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("should reject invalid input", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");

    const result = await createCategoryAction({ name: "" });

    expect(result.success).toBe(false);
  });

  it("should reject name over 50 characters", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");

    const result = await createCategoryAction({ name: "a".repeat(51) });

    expect(result.success).toBe(false);
  });

  it("should revalidate paths on success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "cat-1" }]);

    await createCategoryAction({ name: "Work" });

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-categories", "max");
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-tasks", "max");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/categories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    mockReturning.mockRejectedValue(new Error("DB error"));

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});

describe("updateCategoryAction", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await updateCategoryAction({
      id: validUuid,
      name: "Updated",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should update existing category", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    const mockCategory = { id: validUuid, name: "Updated" };
    mockReturning.mockResolvedValue([mockCategory]);

    const result = await updateCategoryAction({
      id: validUuid,
      name: "Updated",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCategory);
  });

  it("should reject updating another user's category (returns not found)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([]);

    const result = await updateCategoryAction({
      id: validUuid,
      name: "Updated",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Category not found");
  });

  it("should reject duplicate name on update", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    const otherCat = { id: "other-id", name: "Work" };
    mockFindFirst.mockResolvedValue(otherCat);

    const result = await updateCategoryAction({
      id: validUuid,
      name: "Work",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("should reject invalid UUID", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");

    const result = await updateCategoryAction({
      id: "not-a-uuid",
      name: "Updated",
    });

    expect(result.success).toBe(false);
  });

  it("should revalidate paths on success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: validUuid }]);

    await updateCategoryAction({ id: validUuid, name: "Updated" });

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-categories", "max");
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-tasks", "max");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/categories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockFindFirst.mockResolvedValue(null);
    mockReturning.mockRejectedValue(new Error("DB error"));

    const result = await updateCategoryAction({
      id: validUuid,
      name: "Updated",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});

describe("deleteCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await deleteCategoryAction("cat-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should delete category and return success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockReturning.mockResolvedValue([{ id: "cat-1" }]);

    const result = await deleteCategoryAction("cat-1");

    expect(result.success).toBe(true);
  });

  it("should return error for non-existent category", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockReturning.mockResolvedValue([]);

    const result = await deleteCategoryAction("nonexistent");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Category not found");
  });

  it("should reject deleting another user's category", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockReturning.mockResolvedValue([]);

    const result = await deleteCategoryAction("someone-elses-cat");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Category not found");
  });

  it("should revalidate paths on success", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockReturning.mockResolvedValue([{ id: "cat-1" }]);

    await deleteCategoryAction("cat-1");

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-categories", "max");
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-tasks", "max");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/categories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle unexpected errors", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockReturning.mockRejectedValue(new Error("DB error"));

    const result = await deleteCategoryAction("cat-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});
