import { describe, it, expect } from "vitest";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  themeValues,
  dateFormatValues,
  defaultSortValues,
} from "../settings";

describe("updateProfileSchema", () => {
  it("should validate a valid name", () => {
    const result = updateProfileSchema.parse({ name: "John Doe" });
    expect(result.name).toBe("John Doe");
  });

it("should validate name at minimum length", () => {
    const result = updateProfileSchema.parse({ name: "AB" });
    expect(result.name).toBe("AB");
  });

  it("should validate name at exactly 100 characters", () => {
    const result = updateProfileSchema.parse({ name: "A".repeat(100) });
    expect(result.name).toHaveLength(100);
  });

  it("should validate name at exactly 100 characters", () => {
    const result = updateProfileSchema.parse({ name: "A".repeat(100) });
    expect(result.name).toHaveLength(100);
  });

  it("should reject empty name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject name with only whitespace", () => {
    const result = updateProfileSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("should reject name under 2 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("should reject name over 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept name with special characters", () => {
    const result = updateProfileSchema.parse({ name: "José García-Test" });
    expect(result.name).toBe("José García-Test");
  });
});

describe("updatePreferencesSchema", () => {
  it("should validate a valid theme", () => {
    themeValues.forEach((theme) => {
      const result = updatePreferencesSchema.parse({ theme });
      expect(result.theme).toBe(theme);
    });
  });

  it("should validate all valid date formats", () => {
    dateFormatValues.forEach((format) => {
      const result = updatePreferencesSchema.parse({ dateFormat: format });
      expect(result.dateFormat).toBe(format);
    });
  });

  it("should validate all valid sort values", () => {
    defaultSortValues.forEach((sort) => {
      const result = updatePreferencesSchema.parse({ defaultTaskSort: sort });
      expect(result.defaultTaskSort).toBe(sort);
    });
  });

  it("should validate a valid timezone", () => {
    const result = updatePreferencesSchema.parse({ timezone: "America/New_York" });
    expect(result.timezone).toBe("America/New_York");
  });

  it("should validate an empty object (no updates)", () => {
    const result = updatePreferencesSchema.parse({});
    expect(result).toEqual({});
  });

  it("should reject empty timezone", () => {
    const result = updatePreferencesSchema.safeParse({ timezone: "" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid theme", () => {
    const result = updatePreferencesSchema.safeParse({ theme: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", () => {
    const result = updatePreferencesSchema.safeParse({ dateFormat: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid sort value", () => {
    const result = updatePreferencesSchema.safeParse({ defaultTaskSort: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should allow partial updates (only theme)", () => {
    const result = updatePreferencesSchema.parse({ theme: "dark" });
    expect(result.theme).toBe("dark");
  });

  it("should allow partial updates (only timezone)", () => {
    const result = updatePreferencesSchema.parse({ timezone: "Europe/London" });
    expect(result.timezone).toBe("Europe/London");
  });

  it("should allow multiple field updates", () => {
    const result = updatePreferencesSchema.parse({
      theme: "light",
      timezone: "Asia/Tokyo",
      dateFormat: "yyyy-MM-dd",
      defaultTaskSort: "priority_desc",
    });
    expect(result).toEqual({
      theme: "light",
      timezone: "Asia/Tokyo",
      dateFormat: "yyyy-MM-dd",
      defaultTaskSort: "priority_desc",
    });
  });
});