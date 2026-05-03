import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleActionError } from "../action-error";
import { z } from "zod/v4";

describe("handleActionError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a generic fallback message for standard errors", () => {
    const error = new Error("relation 'tasks' does not exist");
    const result = handleActionError("[test]", error, "Failed to create task");

    expect(result).toEqual({
      success: false,
      error: "Failed to create task. Please try again.",
    });
  });

  it("logs the full error to console.error", () => {
    const error = new Error("sensitive database error");
    handleActionError("[testAction]", error, "Something failed");

    expect(console.error).toHaveBeenCalledWith("[testAction]", error);
  });

  it("never returns the raw error.message", () => {
    const sensitiveMessage = "connect ECONNREFUSED 127.0.0.1:5432";
    const error = new Error(sensitiveMessage);
    const result = handleActionError("[test]", error, "Failed");

    expect(result.error).not.toContain(sensitiveMessage);
    expect(result.error).not.toContain("ECONNREFUSED");
    expect(result.error).not.toContain("5432");
  });

  it("handles ZodError with a generic validation message", () => {
    try {
      z.object({ email: z.email() }).parse({ email: "not-an-email" });
    } catch (error) {
      const result = handleActionError("[test]", error, "Failed");

      expect(result).toEqual({
        success: false,
        error: "Invalid input. Please check your data and try again.",
      });
      // Should NOT contain Zod schema details
      expect(result.error).not.toContain("email");
      expect(result.error).not.toContain("Expected");
    }
  });

  it("handles non-Error objects (strings, numbers, etc.)", () => {
    const result = handleActionError("[test]", "string error", "Failed");

    expect(result).toEqual({
      success: false,
      error: "Failed. Please try again.",
    });
  });

  it("handles null/undefined errors", () => {
    const result = handleActionError("[test]", null, "Failed");

    expect(result).toEqual({
      success: false,
      error: "Failed. Please try again.",
    });
  });
});
