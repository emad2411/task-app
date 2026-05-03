import { describe, it, expect } from "vitest";
import { escapeLike } from "../escape-like";

describe("escapeLike", () => {
  it("returns the same string when there are no wildcards", () => {
    expect(escapeLike("hello world")).toBe("hello world");
  });

  it("returns empty string for empty input", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes the % wildcard character", () => {
    expect(escapeLike("50%")).toBe("50\\%");
    expect(escapeLike("%")).toBe("\\%");
    expect(escapeLike("%%")).toBe("\\%\\%");
  });

  it("escapes the _ wildcard character", () => {
    expect(escapeLike("user_name")).toBe("user\\_name");
    expect(escapeLike("_")).toBe("\\_");
    expect(escapeLike("__")).toBe("\\_\\_");
  });

  it("escapes the backslash character", () => {
    expect(escapeLike("C:\\path")).toBe("C:\\\\path");
    expect(escapeLike("\\")).toBe("\\\\");
  });

  it("escapes mixed wildcard characters", () => {
    expect(escapeLike("%_\\")).toBe("\\%\\_\\\\");
  });

  it("preserves non-wildcard special characters", () => {
    expect(escapeLike("hello@world.com")).toBe("hello@world.com");
    expect(escapeLike("price $100")).toBe("price $100");
    expect(escapeLike("a+b=c")).toBe("a+b=c");
  });

  it("handles strings with wildcards surrounded by normal text", () => {
    expect(escapeLike("before%after")).toBe("before\\%after");
    expect(escapeLike("start_end")).toBe("start\\_end");
  });
});
