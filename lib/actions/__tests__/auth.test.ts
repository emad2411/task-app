import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  signInAction,
  signUpAction,
  forgotPasswordAction,
  resetPasswordAction,
  updatePasswordAction,
  verifyEmailAction,
} from "../auth";

// Mock better-auth
vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      verifyEmail: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { email: "email" },
}));

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";

describe("signInAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid credentials", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValue({} as any);

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ message: "Signed in successfully" });
    expect(auth.api.signInEmail).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { email: "user@example.com", password: "password123" },
    });
  });

  it("should return error for invalid email format", async () => {
    const result = await signInAction({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain("email");
  });

  it("should return error for short password", async () => {
    const result = await signInAction({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("8 characters");
  });

  it("should return error when auth fails", async () => {
    vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error("Invalid email or password"));

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email or password");
  });

  it("should handle auth API errors", async () => {
    vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error("Network error"));

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });
});

describe("signUpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid registration", async () => {
    const mockUser = { id: "user-123", email: "user@example.com", name: "John Doe" };
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    vi.mocked(auth.api.signUpEmail).mockResolvedValue(mockUser as any);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ user: mockUser });
    expect(auth.api.signUpEmail).toHaveBeenCalledWith({
      headers: expect.any(Headers),
      body: { email: "user@example.com", password: "password123", name: "John Doe" },
    });
  });

  it("should return error for empty name", async () => {
    const result = await signUpAction({
      name: "",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Name");
  });

  it("should return error for long name", async () => {
    const result = await signUpAction({
      name: "a".repeat(101),
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("100 characters");
  });

  it("should return success with null user when signup returns null", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
    vi.mocked(auth.api.signUpEmail).mockResolvedValue(null as any);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ user: null });
  });

  it("should return error when user already exists", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: "existing-user" } as any);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });
});

describe("forgotPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return generic success message for valid email", async () => {
    vi.mocked(auth.api.requestPasswordReset).mockResolvedValue(undefined as any);

    const result = await forgotPasswordAction({
      email: "user@example.com",
    });

    expect(result.success).toBe(true);
    expect((result.data as { message: string })?.message).toContain("If an account exists");
    expect(auth.api.requestPasswordReset).toHaveBeenCalledWith({
      body: {
        email: "user@example.com",
        redirectTo: expect.stringContaining("/reset-password"),
      },
    });
  });

  it("should return generic success message even for invalid email", async () => {
    const result = await forgotPasswordAction({
      email: "not-an-email",
    });

    expect(result.success).toBe(true);
    expect((result.data as { message: string })?.message).toContain("If an account exists");
  });

  it("should return generic success message even when API fails", async () => {
    vi.mocked(auth.api.requestPasswordReset).mockRejectedValue(new Error("API error"));

    const result = await forgotPasswordAction({
      email: "user@example.com",
    });

    expect(result.success).toBe(true);
    expect((result.data as { message: string })?.message).toContain("If an account exists");
  });
});

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid token and password", async () => {
    vi.mocked(auth.api.resetPassword).mockResolvedValue(undefined as any);

    const result = await resetPasswordAction({
      token: "valid-reset-token",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ message: "Password reset successfully" });
    expect(auth.api.resetPassword).toHaveBeenCalledWith({
      body: { token: "valid-reset-token", newPassword: "newpassword123" },
    });
  });

  it("should return error for empty token", async () => {
    const result = await resetPasswordAction({
      token: "",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain("token");
  });

  it("should return error for short password", async () => {
    const result = await resetPasswordAction({
      token: "valid-token",
      newPassword: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("8 characters");
  });

  it("should return error when reset fails", async () => {
    vi.mocked(auth.api.resetPassword).mockRejectedValue(new Error("Invalid token"));

    const result = await resetPasswordAction({
      token: "invalid-token",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid token");
  });
});

describe("updatePasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid password change", async () => {
    vi.mocked(auth.api.changePassword).mockResolvedValue(undefined as any);

    const result = await updatePasswordAction({
      currentPassword: "oldpassword123",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ message: "Password updated successfully" });
    expect(auth.api.changePassword).toHaveBeenCalledWith({
      headers: expect.any(Object),
      body: {
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        revokeOtherSessions: true,
      },
    });
  });

  it("should return error for empty current password", async () => {
    const result = await updatePasswordAction({
      currentPassword: "",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Current password");
  });

  it("should return error for short new password", async () => {
    const result = await updatePasswordAction({
      currentPassword: "oldpassword123",
      newPassword: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("8 characters");
  });

  it("should return specific error for incorrect current password", async () => {
    const error = new Error("current password is incorrect");
    vi.mocked(auth.api.changePassword).mockRejectedValue(error);

    const result = await updatePasswordAction({
      currentPassword: "wrongpassword",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Current password is incorrect");
  });
});

describe("verifyEmailAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid token", async () => {
    vi.mocked(auth.api.verifyEmail).mockResolvedValue(undefined as any);

    const result = await verifyEmailAction({
      token: "valid-verification-token",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ message: "Email verified successfully" });
    expect(auth.api.verifyEmail).toHaveBeenCalledWith({
      query: { token: "valid-verification-token" },
    });
  });

  it("should return error for empty token", async () => {
    const result = await verifyEmailAction({
      token: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain("token");
  });

  it("should return error when verification fails", async () => {
    vi.mocked(auth.api.verifyEmail).mockRejectedValue(new Error("Invalid token"));

    const result = await verifyEmailAction({
      token: "invalid-token",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid token");
  });
});

describe("ActionResult structure", () => {
  it("should return success structure with data", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValue({ ok: true } as any);

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("data");
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it("should return error structure with message", async () => {
    const result = await signInAction({
      email: "invalid",
      password: "password123",
    });

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("error");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});