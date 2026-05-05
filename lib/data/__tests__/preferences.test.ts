import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockReturning = vi.fn();
const mockOnConflictDoUpdate = vi.fn(() => ({ returning: mockReturning }));
const mockValues = vi.fn(() => ({ onConflictDoUpdate: mockOnConflictDoUpdate }));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      userPreferences: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: vi.fn(() => ({ values: mockValues })),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  userPreferences: { userId: "userId" },
}));

import { getUserPreferences, upsertUserPreferences } from "../preferences";

describe("getUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return preferences for existing user", async () => {
    const mockPrefs = {
      userId: "user-123",
      theme: "dark",
      timezone: "America/New_York",
    };
    mockFindFirst.mockResolvedValue(mockPrefs);

    const result = await getUserPreferences("user-123");

    expect(result).toEqual(mockPrefs);
  });

  it("should return undefined (null) for missing user", async () => {
    mockFindFirst.mockResolvedValue(undefined);

    const result = await getUserPreferences("nonexistent");

    expect(result).toBeUndefined();
  });
});

describe("upsertUserPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert preferences with onConflictDoUpdate", async () => {
    const createdPrefs = {
      userId: "user-123",
      theme: "dark",
      timezone: "UTC",
    };
    mockReturning.mockResolvedValue([createdPrefs]);

    const result = await upsertUserPreferences("user-123", {
      theme: "dark",
    });

    expect(result).toEqual(createdPrefs);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        theme: "dark",
        timezone: "UTC",
        dateFormat: "MM/dd/yyyy",
        defaultTaskSort: "due_date_asc",
      })
    );
    expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.anything(),
        set: expect.objectContaining({ theme: "dark" }),
      })
    );
  });

  it("should use defaults when creating with empty data", async () => {
    mockReturning.mockResolvedValue([
      {
        userId: "user-123",
        theme: "system",
        timezone: "UTC",
        dateFormat: "MM/dd/yyyy",
        defaultTaskSort: "due_date_asc",
      },
    ]);

    const result = await upsertUserPreferences("user-123", {});

    expect(result).toBeDefined();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        theme: "system",
        timezone: "UTC",
        dateFormat: "MM/dd/yyyy",
        defaultTaskSort: "due_date_asc",
      })
    );
  });
});
