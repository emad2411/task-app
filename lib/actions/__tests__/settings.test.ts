import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

const mockRequireUserId = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  requireUserId: (...args: unknown[]) => mockRequireUserId(...args),
}));

mockRequireUserId.mockResolvedValue("user-123");

const mockUpdateUser = vi.fn();
vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

const mockReturning = vi.fn();
const mockSet = vi.fn(() => ({ where: vi.fn(() => ({ returning: mockReturning })) }));

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => ({ set: mockSet })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: "id" },
}));

const mockUpsertUserPreferences = vi.fn();
vi.mock("@/lib/data/preferences", () => ({
  upsertUserPreferences: (...args: unknown[]) => mockUpsertUserPreferences(...args),
}));

import { updateProfileAction, updatePreferencesAction } from "../settings";

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUserId.mockResolvedValue("user-123");
  });

  it("should update user name", async () => {
    mockUpdateUser.mockResolvedValue({ user: { id: "user-123", name: "John" } });
    mockReturning.mockResolvedValue([{ id: "user-123" }]);

    const result = await updateProfileAction({ name: "John Doe" });

    expect(result.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { name: "John Doe" },
    });
  });

  it("should reject unauthenticated user", async () => {
    mockRequireUserId.mockRejectedValue(new Error("Unauthorized"));

    const result = await updateProfileAction({ name: "John Doe" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should reject invalid name (< 2 chars)", async () => {
    const result = await updateProfileAction({ name: "A" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("at least 2 characters");
  });

  it("should reject empty name after trim", async () => {
    const result = await updateProfileAction({ name: "   " });

    expect(result.success).toBe(false);
  });

  it("should reject name over 100 characters", async () => {
    const result = await updateProfileAction({ name: "a".repeat(101) });

    expect(result.success).toBe(false);
  });

  it("should revalidate paths on success", async () => {
    mockUpdateUser.mockResolvedValue({ user: { id: "user-123" } });
    mockReturning.mockResolvedValue([{ id: "user-123" }]);

    await updateProfileAction({ name: "John Doe" });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle API errors", async () => {
    mockUpdateUser.mockRejectedValue(new Error("API error"));

    const result = await updateProfileAction({ name: "John Doe" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("API error");
  });
});

describe("updatePreferencesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUserId.mockResolvedValue("user-123");
  });

  it("should update preferences", async () => {
    mockUpsertUserPreferences.mockResolvedValue({
      userId: "user-123",
      theme: "dark",
    });

    const result = await updatePreferencesAction({ theme: "dark" });

    expect(result.success).toBe(true);
    expect(mockUpsertUserPreferences).toHaveBeenCalledWith("user-123", {
      theme: "dark",
    });
  });

  it("should reject unauthenticated user", async () => {
    mockRequireUserId.mockRejectedValue(new Error("Unauthorized"));

    const result = await updatePreferencesAction({ theme: "dark" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should reject invalid theme value", async () => {
    const result = await updatePreferencesAction({
      theme: "invalid",
    } as Record<string, string>);

    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", async () => {
    const result = await updatePreferencesAction({
      dateFormat: "invalid",
    } as Record<string, string>);

    expect(result.success).toBe(false);
  });

  it("should reject invalid sort value", async () => {
    const result = await updatePreferencesAction({
      defaultTaskSort: "invalid",
    } as Record<string, string>);

    expect(result.success).toBe(false);
  });

  it("should accept partial preferences update", async () => {
    mockUpsertUserPreferences.mockResolvedValue({
      userId: "user-123",
      timezone: "America/New_York",
    });

    const result = await updatePreferencesAction({
      timezone: "America/New_York",
    });

    expect(result.success).toBe(true);
  });

  it("should accept multiple field update", async () => {
    mockUpsertUserPreferences.mockResolvedValue({
      userId: "user-123",
      theme: "light",
      timezone: "Asia/Tokyo",
    });

    const result = await updatePreferencesAction({
      theme: "light",
      timezone: "Asia/Tokyo",
      dateFormat: "yyyy-MM-dd",
      defaultTaskSort: "priority_desc",
    });

    expect(result.success).toBe(true);
  });

  it("should accept empty object", async () => {
    mockUpsertUserPreferences.mockResolvedValue({
      userId: "user-123",
    });

    const result = await updatePreferencesAction({});

    expect(result.success).toBe(true);
  });

  it("should revalidate paths on success", async () => {
    mockUpsertUserPreferences.mockResolvedValue({ userId: "user-123" });

    await updatePreferencesAction({ theme: "dark" });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("should handle upsert failures", async () => {
    mockUpsertUserPreferences.mockRejectedValue(new Error("DB error"));

    const result = await updatePreferencesAction({ theme: "dark" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});
