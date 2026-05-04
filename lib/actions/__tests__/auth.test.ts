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

vi.mock("@/lib/rate-limit", () => ({
  authLimiter: { limit: vi.fn().mockResolvedValue({ success: true, limit: 5, reset: 0, remaining: 4 }) },
  forgotPasswordLimiter: { limit: vi.fn().mockResolvedValue({ success: true, limit: 3, reset: 0, remaining: 2 }) },
}));

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { authLimiter, forgotPasswordLimiter } from "@/lib/rate-limit";

describe("signInAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authLimiter.limit).mockResolvedValue({ success: true, limit: 5, reset: 0, remaining: 4 });
  });

  it("should return success for valid credentials", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValue({} as unknown);

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
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error for short password", async () => {
    const result = await signInAction({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error when auth fails", async () => {
    vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error("Invalid email or password"));

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("An unexpected error occurred. Please try again.");
  });

  it("should handle auth API errors", async () => {
    vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error("Network error"));

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("An unexpected error occurred. Please try again.");
  });

  it("should return rate limit error when authLimiter rejects", async () => {
    vi.mocked(authLimiter.limit).mockResolvedValue({ success: false, limit: 5, reset: Date.now() + 60000, remaining: 0 });

    const result = await signInAction({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Too many requests. Please try again later.");
    expect(auth.api.signInEmail).not.toHaveBeenCalled();
  });
});

describe("signUpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authLimiter.limit).mockResolvedValue({ success: true, limit: 5, reset: 0, remaining: 4 });
  });

  it("should return success for valid registration", async () => {
    const mockUser = { id: "user-123", email: "user@example.com", name: "John Doe" };
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null);
    vi.mocked(auth.api.signUpEmail).mockResolvedValue(mockUser as unknown);

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
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error for long name", async () => {
    const result = await signUpAction({
      name: "a".repeat(101),
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return success with null user when signup returns null", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null);
    vi.mocked(auth.api.signUpEmail).mockResolvedValue(null);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ user: null });
  });

  it("should return error when user already exists", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: "existing-user" } as unknown);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("should return rate limit error when authLimiter rejects", async () => {
    vi.mocked(authLimiter.limit).mockResolvedValue({ success: false, limit: 5, reset: Date.now() + 60000, remaining: 0 });
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Too many requests. Please try again later.");
    expect(auth.api.signUpEmail).not.toHaveBeenCalled();
  });
});

describe("forgotPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(forgotPasswordLimiter.limit).mockResolvedValue({ success: true, limit: 3, reset: 0, remaining: 2 });
  });

  it("should return generic success message for valid email", async () => {
    vi.mocked(auth.api.requestPasswordReset).mockResolvedValue(undefined);

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

  it("should return rate limit error when forgotPasswordLimiter rejects", async () => {
    vi.mocked(forgotPasswordLimiter.limit).mockResolvedValue({ success: false, limit: 3, reset: Date.now() + 3600000, remaining: 0 });

    const result = await forgotPasswordAction({
      email: "user@example.com",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Too many password reset requests. Please wait before trying again.");
    expect(auth.api.requestPasswordReset).not.toHaveBeenCalled();
  });
});

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid token and password", async () => {
    vi.mocked(auth.api.resetPassword).mockResolvedValue(undefined);

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
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error for short password", async () => {
    const result = await resetPasswordAction({
      token: "valid-token",
      newPassword: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error when reset fails", async () => {
    vi.mocked(auth.api.resetPassword).mockRejectedValue(new Error("Invalid token"));

    const result = await resetPasswordAction({
      token: "invalid-token",
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to reset password. Please try again.");
  });
});

describe("updatePasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid password change", async () => {
    vi.mocked(auth.api.changePassword).mockResolvedValue(undefined);

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
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
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
    vi.mocked(auth.api.verifyEmail).mockResolvedValue(undefined);

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
    expect(result.error).toBe("Invalid input. Please check your data and try again.");
  });

  it("should return error when verification fails", async () => {
    vi.mocked(auth.api.verifyEmail).mockRejectedValue(new Error("Invalid token"));

    const result = await verifyEmailAction({
      token: "invalid-token",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to verify email. Please try again.");
  });
});

describe("ActionResult structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authLimiter.limit).mockResolvedValue({ success: true, limit: 5, reset: 0, remaining: 4 });
  });

  it("should return success structure with data", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValue({ ok: true } as unknown);

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