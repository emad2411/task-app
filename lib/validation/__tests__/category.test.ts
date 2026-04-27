import { describe, it, expect } from "vitest";
import {
  createCategorySchema,
  updateCategorySchema,
  CATEGORY_COLORS,
} from "../category";

describe("createCategorySchema", () => {
  it("should accept valid name", () => {
    const result = createCategorySchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should reject name over 50 characters", () => {
    const result = createCategorySchema.safeParse({ name: "a".repeat(51) });
    expect(result.success).toBe(false);
  });

  it("should accept name at exactly 50 characters", () => {
    const result = createCategorySchema.safeParse({ name: "a".repeat(50) });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from name", () => {
    const result = createCategorySchema.parse({ name: "  Work  " });
    expect(result.name).toBe("Work");
  });

  it("should accept valid hex color", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "#EF4444",
    });
    expect(result.success).toBe(true);
  });

  it("should accept lowercase hex color", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "#ef4444",
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty color string", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "",
    });
    expect(result.success).toBe(true);
  });

  it("should accept omitted color", () => {
    const result = createCategorySchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBeUndefined();
    }
  });

  it("should reject invalid color format", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "red",
    });
    expect(result.success).toBe(false);
  });

  it("should reject hex color without hash", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "EF4444",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short hex color", () => {
    const result = createCategorySchema.safeParse({
      name: "Work",
      color: "#FFF",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing name", () => {
    const result = createCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should accept all preset category colors as valid", () => {
    for (const color of CATEGORY_COLORS) {
      const result = createCategorySchema.safeParse({
        name: "Test",
        color,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateCategorySchema", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("should accept partial update with name only", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      name: "Updated",
    });
    expect(result.success).toBe(true);
  });

  it("should accept partial update with color only", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      color: "#22C55E",
    });
    expect(result.success).toBe(true);
  });

  it("should accept nullable color", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      color: null,
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty color string", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      color: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing id", () => {
    const result = updateCategorySchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid uuid", () => {
    const result = updateCategorySchema.safeParse({
      id: "not-a-uuid",
      name: "Updated",
    });
    expect(result.success).toBe(false);
  });

  it("should validate name if provided", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("should validate name max length if provided", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("should trim name if provided", () => {
    const result = updateCategorySchema.parse({
      id: validUuid,
      name: "  Work  ",
    });
    expect(result.name).toBe("Work");
  });

  it("should reject invalid color in update", () => {
    const result = updateCategorySchema.safeParse({
      id: validUuid,
      color: "blue",
    });
    expect(result.success).toBe(false);
  });
});
