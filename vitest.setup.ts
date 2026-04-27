import { vi } from "vitest";

// Mock next/cache for tests since cacheComponents config is not available in vitest
vi.mock("next/cache", async () => {
  const actual = await vi.importActual<typeof import("next/cache")>("next/cache");
  return {
    ...actual,
    revalidateTag: vi.fn(),
    cacheTag: vi.fn(),
    cacheLife: vi.fn(),
  };
});
