import { vi } from "vitest";

export const mockReturning = vi.fn();
export const mockValues = vi.fn(() => ({ returning: mockReturning }));
export const mockWhere = vi.fn(() => ({ returning: mockReturning }));
export const mockSet = vi.fn(() => ({ where: mockWhere }));
export const mockFindFirst = vi.fn();

export const db = {
  insert: vi.fn(() => ({ values: mockValues })),
  update: vi.fn(() => ({ set: mockSet })),
  delete: vi.fn(() => ({ where: mockWhere })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        groupBy: vi.fn(() => ({
          orderBy: vi.fn(),
          leftJoin: vi.fn(),
        })),
        leftJoin: vi.fn(),
      })),
      leftJoin: vi.fn(() => ({
        where: vi.fn(() => ({
          groupBy: vi.fn(),
        })),
      })),
    })),
  })),
  query: {
    categories: {
      findMany: vi.fn(),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
    tasks: {
      findMany: vi.fn(),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
    userPreferences: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
};
