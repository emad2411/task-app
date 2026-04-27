# Feature Specification: P3-F4 - Test Coverage for Critical Flows

**Phase:** 3 - Preferences and Polish  
**Feature ID:** P3-F4  
**Feature Name:** Test Coverage for Critical Flows  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-27

---

## 1. Goals

### Primary Goal
Achieve comprehensive test coverage across all critical user flows — authentication, task management, category management, settings, and data layer — so that regressions are caught before they reach production.

### Secondary Goals
- Fix the 2 pre-existing date utility test failures
- Cover all validation schemas with unit tests
- Cover all server actions with unit tests (mocked DB and auth)
- Cover all utility functions with unit tests
- Establish a baseline test count target of **200+ passing tests**
- Ensure every critical flow has at least one positive and one negative test case

---

## 2. Scope

### In Scope

#### Validation Schema Tests
1. **`lib/validation/__tests__/category.test.ts`** — Category validation schemas
2. **`lib/validation/__tests__/auth.test.ts`** — Auth validation schemas (if not already covered by action tests)

#### Server Action Tests
1. **`lib/actions/__tests__/category.test.ts`** — Category CRUD server actions
2. **`lib/actions/__tests__/settings.test.ts`** — Settings server actions (profile, preferences)

#### Utility Tests
1. **`lib/utils/__tests__/date.test.ts`** — Fix 2 pre-existing failures
2. **`lib/utils/__tests__/timezones.test.ts`** — Timezone utility functions (if any exist beyond constants)

#### Data Layer Tests (Integration-style, mocked DB)
1. **`lib/data/__tests__/category.test.ts`** — Category data queries
2. **`lib/data/__tests__/preferences.test.ts`** — Preferences data queries
3. **`lib/data/__tests__/dashboard.test.ts`** — Dashboard data queries
4. **`lib/data/__tests__/task.test.ts`** — Task data queries (if not already covered)

### Out of Scope
- Component/UI tests (React Testing Library) — planned for Phase 4
- E2E tests (Playwright) — planned for Phase 4
- Email template rendering tests — low priority, can be deferred
- Performance/load testing — Phase 4

---

## 3. Current Test Inventory

### Existing Tests (Passing)

| File | Tests | Coverage Area |
|------|-------|---------------|
| `lib/actions/__tests__/auth.test.ts` | 25 | Auth server actions (sign in, sign up, password reset, email verify) |
| `lib/actions/__tests__/task.test.ts` | ~30 | Task server actions (create, update, delete, toggle, archive) |
| `lib/validation/__tests__/settings.test.ts` | 21 | Settings validation schemas |
| `lib/validation/__tests__/task.test.ts` | ~20 | Task validation schemas |
| `lib/utils/__tests__/task-grouping.test.ts` | 15 | Task grouping utility |
| `lib/utils/date.test.ts` | 22 (20 pass, 2 fail) | Date utilities |

**Total: ~133 tests (131 passing, 2 failing)**

### Missing Tests

| File to Create | Expected Tests | Coverage Area |
|----------------|----------------|---------------|
| `lib/validation/__tests__/category.test.ts` | ~10 | Category validation schemas |
| `lib/actions/__tests__/category.test.ts` | ~15 | Category server actions |
| `lib/actions/__tests__/settings.test.ts` | ~15 | Settings server actions |
| `lib/data/__tests__/category.test.ts` | ~8 | Category data layer |
| `lib/data/__tests__/preferences.test.ts` | ~8 | Preferences data layer |
| `lib/data/__tests__/dashboard.test.ts` | ~8 | Dashboard data layer |
| `lib/data/__tests__/task.test.ts` | ~10 | Task data layer |
| `lib/utils/__tests__/date.test.ts` (fix) | +2 | Fix 2 pre-existing failures |

**Expected total after P3-F4: ~225+ passing tests**

---

## 4. Requirements

### 4.1 Functional Requirements

#### REQ-001: Category Validation Tests
**Priority:** P0  
**Description:** Test all category validation schemas

**Acceptance Criteria:**
- [ ] `createCategorySchema` accepts valid name
- [ ] `createCategorySchema` rejects empty name
- [ ] `createCategorySchema` rejects name > 50 chars
- [ ] `createCategorySchema` trims whitespace
- [ ] `createCategorySchema` accepts valid color (hex or preset)
- [ ] `createCategorySchema` rejects invalid color format
- [ ] `updateCategorySchema` accepts partial updates
- [ ] `updateCategorySchema` requires at least one field

#### REQ-002: Category Server Action Tests
**Priority:** P0  
**Description:** Test all category server actions with mocked DB and auth

**Acceptance Criteria:**
- [ ] `createCategoryAction` creates category with valid input
- [ ] `createCategoryAction` rejects unauthenticated user
- [ ] `createCategoryAction` rejects invalid input
- [ ] `updateCategoryAction` updates existing category
- [ ] `updateCategoryAction` rejects updating another user's category
- [ ] `deleteCategoryAction` deletes category and nullifies task categoryIds
- [ ] `deleteCategoryAction` rejects deleting another user's category
- [ ] `deleteCategoryAction` returns error for non-existent category

#### REQ-003: Settings Server Action Tests
**Priority:** P0  
**Description:** Test all settings server actions with mocked DB and auth

**Acceptance Criteria:**
- [ ] `updateProfileAction` updates user name
- [ ] `updateProfileAction` rejects unauthenticated user
- [ ] `updateProfileAction` rejects invalid name (< 2 chars)
- [ ] `updatePreferencesAction` creates preferences record if none exists
- [ ] `updatePreferencesAction` updates existing preferences
- [ ] `updatePreferencesAction` rejects unauthenticated user
- [ ] `updatePreferencesAction` rejects invalid theme value

#### REQ-004: Data Layer Tests
**Priority:** P1  
**Description:** Test data layer functions with mocked database

**Acceptance Criteria:**
- [ ] `lib/data/category.ts` — `getCategoriesByUserId` returns user's categories
- [ ] `lib/data/category.ts` — `getCategoryById` returns category scoped to user
- [ ] `lib/data/category.ts` — `createCategory` inserts and returns new record
- [ ] `lib/data/category.ts` — `updateCategory` updates existing record
- [ ] `lib/data/category.ts` — `deleteCategory` removes record
- [ ] `lib/data/preferences.ts` — `getUserPreferences` returns null for missing user
- [ ] `lib/data/preferences.ts` — `upsertUserPreferences` creates new record
- [ ] `lib/data/preferences.ts` — `upsertUserPreferences` updates existing record
- [ ] `lib/data/dashboard.ts` — `getDashboardData` returns correct counts
- [ ] `lib/data/dashboard.ts` — `getDashboardData` scopes to userId
- [ ] `lib/data/task.ts` — `getTasksByUserId` returns user's tasks
- [ ] `lib/data/task.ts` — `getTaskById` scopes to userId
- [ ] `lib/data/task.ts` — filter and sort options work correctly

#### REQ-005: Fix Pre-existing Date Test Failures
**Priority:** P0  
**Description:** Investigate and fix 2 failing tests in `lib/utils/date.test.ts`

**Acceptance Criteria:**
- [ ] Identify root cause of 2 failing tests
- [ ] Fix implementation or tests as appropriate
- [ ] All 22 date utility tests pass
- [ ] No regression in dashboard or task date displays

#### REQ-006: Test Configuration
**Priority:** P0  
**Description:** Ensure test infrastructure is properly configured

**Acceptance Criteria:**
- [ ] Vitest config supports path aliases (`@/*`)
- [ ] Mock utilities available for DB and auth
- [ ] Test setup file initializes mocks consistently
- [ ] `npm run test` runs all tests and exits cleanly
- [ ] Test output shows clear pass/fail summary

---

## 5. Testing Architecture

### 5.1 Mocking Strategy

#### Database Mocking
```typescript
// lib/__mocks__/db.ts
import { vi } from "vitest";

export const db = {
  query: {
    categories: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    tasks: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    userPreferences: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(),
  })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(),
    })),
  })),
};
```

#### Auth Mocking
```typescript
// lib/__mocks__/auth/session.ts
import { vi } from "vitest";

export const getSession = vi.fn();
export const requireUserId = vi.fn();
export const getCurrentUserId = vi.fn();
export const requireAuth = vi.fn();
```

### 5.2 Test File Structure

```
lib/
├── __mocks__/
│   ├── db.ts                    # Drizzle ORM mock
│   └── auth/
│       └── session.ts           # Auth session mock
├── actions/
│   └── __tests__/
│       ├── auth.test.ts         # ✅ Existing (25 tests)
│       ├── task.test.ts         # ✅ Existing (~30 tests)
│       ├── category.test.ts     # 🆕 ~15 tests
│       └── settings.test.ts     # 🆕 ~15 tests
├── data/
│   └── __tests__/
│       ├── category.test.ts     # 🆕 ~8 tests
│       ├── preferences.test.ts  # 🆕 ~8 tests
│       ├── dashboard.test.ts    # 🆕 ~8 tests
│       └── task.test.ts         # 🆕 ~10 tests
├── utils/
│   └── __tests__/
│       ├── date.test.ts         # 🔧 Fix 2 failures
│       └── task-grouping.test.ts# ✅ Existing (15 tests)
└── validation/
    └── __tests__/
        ├── settings.test.ts     # ✅ Existing (21 tests)
        ├── task.test.ts         # ✅ Existing (~20 tests)
        ├── category.test.ts     # 🆕 ~10 tests
        └── auth.test.ts         # 🆕 ~10 tests (if not covered)
```

### 5.3 Test Patterns

#### Server Action Test Pattern
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCategoryAction } from "../category";
import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";

vi.mock("@/lib/auth/session");
vi.mock("@/lib/db");

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates category with valid input", async () => {
    vi.mocked(requireUserId).mockResolvedValue("user-123");
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "cat-1", name: "Work" }]),
      }),
    } as any);

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Work");
  });

  it("rejects unauthenticated user", async () => {
    vi.mocked(requireUserId).mockRejectedValue(new Error("Unauthorized"));

    const result = await createCategoryAction({ name: "Work" });

    expect(result.success).toBe(false);
  });
});
```

#### Validation Schema Test Pattern
```typescript
import { describe, it, expect } from "vitest";
import { createCategorySchema } from "../category";

describe("createCategorySchema", () => {
  it("accepts valid name", () => {
    const result = createCategorySchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCategorySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
```

---

## 6. Implementation Order

### Phase 1: Fix Failures (Highest Priority)
1. Investigate and fix 2 failing date utility tests
2. Verify all existing tests still pass

### Phase 2: Validation Schemas
3. Create `lib/validation/__tests__/category.test.ts`
4. Create `lib/validation/__tests__/auth.test.ts` (if not covered)

### Phase 3: Server Actions
5. Create `lib/__mocks__/db.ts` and `lib/__mocks__/auth/session.ts`
6. Create `lib/actions/__tests__/category.test.ts`
7. Create `lib/actions/__tests__/settings.test.ts`

### Phase 4: Data Layer
8. Create `lib/data/__tests__/category.test.ts`
9. Create `lib/data/__tests__/preferences.test.ts`
10. Create `lib/data/__tests__/dashboard.test.ts`
11. Create `lib/data/__tests__/task.test.ts`

### Phase 5: Verify and Report
12. Run full test suite
13. Document test count and coverage summary
14. Update `current-feature.md`

---

## 7. Acceptance Criteria Summary

### Test Coverage Criteria

| Area | Before | Target | Status |
|------|--------|--------|--------|
| Validation schemas | ~41 tests | ~61 tests | 🆕 +20 |
| Server actions | ~55 tests | ~85 tests | 🆕 +30 |
| Data layer | 0 tests | ~34 tests | 🆕 +34 |
| Utilities | 37 tests (2 fail) | 39 tests (0 fail) | 🔧 Fix 2 |
| **Total** | **~133 (131 pass)** | **~219 (219 pass)** | **🎯 +88** |

### Quality Gates
- [ ] Zero failing tests
- [ ] All new tests follow consistent naming and structure
- [ ] Mocks are reusable and well-documented
- [ ] `npm run test` completes in < 30 seconds
- [ ] No test uses real database connections (all mocked)
- [ ] Every server action has at least one positive and one negative test
- [ ] Every validation schema has at least one valid and one invalid test case

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mocking Drizzle ORM is complex | Medium | Use chainable mock helpers that mirror Drizzle's fluent API |
| Server actions depend on `revalidatePath` | Low | Mock `next/cache` module |
| Date test failures are timezone-related | Medium | Use `vi.useFakeTimers()` and fixed timezone in tests |
| Tests become slow with many mocks | Low | Keep mocks lightweight, avoid unnecessary setup |
| Test count target not reached | Low | Focus on critical flows first; data layer tests are bonus |

---

## 9. Related Documentation

- **PRD.md** §21 — Phase 3: "Add test coverage for critical flows"
- **PRD.md** §22 — QA and Acceptance Checklist
- **coding-standards.md** — TypeScript and testing conventions
- **ai-interaction.md** — Workflow for implementation
- **vitest.config.ts** — Test configuration
- **lib/utils/date.test.ts** — File with 2 pre-existing failures

---

## 10. Definition of Done

- [ ] 2 pre-existing date utility test failures fixed
- [ ] Category validation tests written and passing
- [ ] Category server action tests written and passing
- [ ] Settings server action tests written and passing
- [ ] Category data layer tests written and passing
- [ ] Preferences data layer tests written and passing
- [ ] Dashboard data layer tests written and passing
- [ ] Task data layer tests written and passing
- [ ] All tests pass with `npm run test`
- [ ] Test count ≥ 200 passing tests
- [ ] Build passes (`npm run build`)
- [ ] No test uses real database connections
- [ ] Mock utilities documented for future use

---

## 11. Test Count Tracking

| Milestone | Expected Count | Notes |
|-----------|----------------|-------|
| Starting point | ~131 passing | 2 date tests failing |
| After date fix | ~133 passing | +2 from fixing failures |
| After category validation | ~143 passing | +10 |
| After category actions | ~158 passing | +15 |
| After settings actions | ~173 passing | +15 |
| After data layer tests | ~207 passing | +34 |
| **Final target** | **≥ 219 passing** | All green |

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P3-F4-test-coverage`
3. Implement in order: Fix date tests → Validation schemas → Mock setup → Server actions → Data layer → Verify
4. Run full test suite and confirm ≥ 200 passing tests
5. Build and commit
