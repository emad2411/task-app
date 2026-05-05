import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRevalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
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
    expect(result.error).toBe("Failed to update profile. Please try again.");
  });

  it("should reject invalid name (< 2 chars)", async () => {
    const result = await updateProfileAction({ name: "A" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should reject empty name after trim", async () => {
    const result = await updateProfileAction({ name: "   " });

    expect(result.success).toBe(false);
  });

  it("should reject name over 100 characters", async () => {
    const result = await updateProfileAction({ name: "a".repeat(101) });

    expect(result.success).toBe(false);
  });

  it("should revalidate tags on success", async () => {
    mockUpdateUser.mockResolvedValue({ user: { id: "user-123" } });

    await updateProfileAction({ name: "John Doe" });

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-preferences", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-dashboard", { expire: 0 });
  });

  it("should handle API errors", async () => {
    mockUpdateUser.mockRejectedValue(new Error("API error"));

    const result = await updateProfileAction({ name: "John Doe" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update profile. Please try again.");
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
    expect(result.error).toBe("Failed to update preferences. Please try again.");
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

  it("should revalidate tags on success", async () => {
    mockUpsertUserPreferences.mockResolvedValue({ userId: "user-123" });

    await updatePreferencesAction({ theme: "dark" });

    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-preferences", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-dashboard", { expire: 0 });
    expect(mockRevalidateTag).toHaveBeenCalledWith("user-user-123-tasks", { expire: 0 });
  });

  it("should handle upsert failures", async () => {
    mockUpsertUserPreferences.mockRejectedValue(new Error("DB error"));

    const result = await updatePreferencesAction({ theme: "dark" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update preferences. Please try again.");
  });
});
