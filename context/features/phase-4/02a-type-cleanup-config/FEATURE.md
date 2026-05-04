# Feature Specification: P4-F2a — Type Consolidation, Import Cleanup & Config

**Phase:** 4 — Hardening  
**Feature ID:** P4-F2a  
**Feature Name:** Type Consolidation, Import Cleanup & Config  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-04  
**Estimated Effort:** 1–1.5 hours  
**Dependencies:** None (no new npm packages required)  
**Prerequisites:** P4-F1a, P4-F1b, P4-F1c should be completed first  
**Branch:** `feature/P4-F2a-type-cleanup-config`

---

## 1. Overview

This feature handles the low-risk, mechanical cleanup items from the code review suggestions. These are safe, isolated changes that don't affect runtime behavior — extracting a shared type, removing unused imports, adding a Next.js config flag, and fixing `any` types in tests.

### What You're Fixing

| # | Suggestion | Risk | One-Line Summary |
|---|-----------|------|------------------|
| 14 | Duplicated ActionResult Type | **Low** | Same interface copy-pasted across 3 action files |
| 15 | Unused Import in db/index.ts | **Low** | `neonConfig` imported but never used |
| 16 | Unused Imports Across Components | **Low** | Unused imports in 7 component files |
| 17 | Missing skipProxyUrlNormalize | **Low** | Next.js 16 config flag missing |
| 18 | `any` Types in Test Files | **Low** | 12 `as any` casts in auth tests + 2 `any` params in seed script |

---

## 2. Prerequisites

Before starting, make sure you can:

1. Run `npm run build` with no errors
2. Run `npm run lint` with no errors
3. Run `npm run test` with all tests passing

---

## 3. Implementation Steps

### Step 1: Extract ActionResult to Shared Type File

> **Why?** The `ActionResult` interface is defined identically in `auth.ts`, `task.ts`, and `category.ts`. `settings.ts` re-imports it from `auth.ts`. A single source of truth is cleaner and avoids drift.

#### 3.1.1 Create the shared type file

**File:** `lib/actions/types.ts` ← **NEW FILE**

```ts
/**
 * Standard return type for all server actions.
 *
 * Every server action returns this shape so client components
 * can handle success/error uniformly.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

#### 3.1.2 Update `lib/actions/auth.ts`

**Remove** the local `ActionResult` definition (lines 28–32) and add an import:

**Before (lines 16–32):**
```ts
import { handleActionError } from "@/lib/utils/action-error";
import { authLimiter, forgotPasswordLimiter } from "@/lib/rate-limit";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**After:**
```ts
import { handleActionError } from "@/lib/utils/action-error";
import { authLimiter, forgotPasswordLimiter } from "@/lib/rate-limit";
import { type ActionResult } from "@/lib/actions/types";
```

> **Important:** `auth.ts` previously *exported* this type, and `settings.ts` imports it from `@/lib/actions/auth`. We need to keep a re-export so we don't break `settings.ts` until we update it too. **However**, since we're updating all 4 files in this step, we'll update `settings.ts` to import from `types.ts` directly, so no re-export is needed.

#### 3.1.3 Update `lib/actions/task.ts`

**Remove** the local `ActionResult` definition (lines 11–15) and add an import:

**Before (lines 9–15):**
```ts
import { handleActionError } from "@/lib/utils/action-error";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**After:**
```ts
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";
```

#### 3.1.4 Update `lib/actions/category.ts`

**Remove** the local `ActionResult` definition (lines 11–15) and add an import:

**Before (lines 9–15):**
```ts
import { handleActionError } from "@/lib/utils/action-error";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**After:**
```ts
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";
```

#### 3.1.5 Update `lib/actions/settings.ts`

Change the import source from `@/lib/actions/auth` to `@/lib/actions/types`:

**Before (line 18):**
```ts
import { type ActionResult } from "@/lib/actions/auth";
```

**After:**
```ts
import { type ActionResult } from "@/lib/actions/types";
```

#### 3.1.6 Verify

```bash
npm run build
```

**Expected:** Build passes. No runtime change — this is purely a type refactor.

---

### Step 2: Remove Unused `neonConfig` Import

> **Why?** `neonConfig` is imported from `@neondatabase/serverless` but never referenced anywhere in `lib/db/index.ts`. Dead imports add confusion.

**File:** `lib/db/index.ts` ← **MODIFY**

**Before (line 1):**
```ts
import { neon, neonConfig } from "@neondatabase/serverless";
```

**After:**
```ts
import { neon } from "@neondatabase/serverless";
```

---

### Step 3: Remove Unused Imports Across Components

> **Why?** ESLint flags these as warnings. Each file has one or more imports that are never referenced in the component code.

#### 3.3.1 `components/auth/reset-password-form.tsx`

**Before (line 9):**
```ts
import { Eye, EyeOff, Loader2, FolderOpen } from "lucide-react";
```

**After:**
```ts
import { Eye, EyeOff, Loader2 } from "lucide-react";
```

Also remove the unused type import. Find (line 24):

**Before:**
```ts
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";
```

**After:**
```ts
import { resetPasswordSchema } from "@/lib/validation/auth";
```

#### 3.3.2 `components/auth/sign-up-form.tsx`

**Before (line 14):**
```ts
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";
```

**After:**
```ts
import { signUpSchema } from "@/lib/validation/auth";
```

#### 3.3.3 `components/auth/verify-email-handler.tsx`

Remove `Controller` (unused), `FolderOpen` (unused), `verifyEmailSchema` (unused), and `VerifyEmailInput` (unused):

**Before (line 4):**
```ts
import { Controller, useForm } from "react-hook-form";
```

**After:**
```ts
import { useForm } from "react-hook-form";
```

**Before (line 9):**
```ts
import { Loader2, FolderOpen } from "lucide-react";
```

**After:**
```ts
import { Loader2 } from "lucide-react";
```

**Before (lines 22–24):**
```ts
import {
  verifyEmailSchema, forgotPasswordSchema,
  type VerifyEmailInput, type ForgotPasswordInput,
} from "@/lib/validation/auth";
```

**After:**
```ts
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
```

#### 3.3.4 `components/settings/appearance-form.tsx`

Remove unused `Button` import:

**Before (line 8):**
```ts
import { Button } from "@/components/ui/button";
```

**After:** Delete this line entirely.

#### 3.3.5 `components/settings/preferences-form.tsx`

Remove `useState` (unused), `dateFormatValues` (unused), `defaultSortValues` (unused):

**Before (line 3):**
```ts
import { useState, useTransition } from "react";
```

**After:**
```ts
import { useTransition } from "react";
```

**Before (lines 21–24):**
```ts
import {
  updatePreferencesSchema, type UpdatePreferencesInput,
  dateFormatValues, defaultSortValues,
} from "@/lib/validation/settings";
```

**After:**
```ts
import {
  updatePreferencesSchema, type UpdatePreferencesInput,
} from "@/lib/validation/settings";
```

#### 3.3.6 `components/settings/profile-form.tsx`

Remove unused `useState`:

**Before (line 3):**
```ts
import { useState, useTransition } from "react";
```

**After:**
```ts
import { useTransition } from "react";
```

#### 3.3.7 Verify

```bash
npm run lint
```

**Expected:** Zero unused import warnings for the files above.

---

### Step 4: Add `skipProxyUrlNormalize` to next.config.ts

> **Why?** Next.js 16 replaces `middleware.ts` with `proxy.ts` and introduces `skipProxyUrlNormalize` as the equivalent of the old `skipMiddlewareUrlNormalize`. Without it, Next.js may normalize URLs before they reach `proxy()`, which can cause issues with encoded characters or trailing slashes in auth callback URLs.

**File:** `next.config.ts` ← **MODIFY**

**Before:**
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
      cacheComponents: true,

  experimental: {
    serverActions: {
      allowedOrigins: ["*.app.github.dev", "localhost:3000"],
    },
  },
};

export default nextConfig;
```

**After:**
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipProxyUrlNormalize: true,
  cacheComponents: true,

  experimental: {
    serverActions: {
      allowedOrigins: ["*.app.github.dev", "localhost:3000"],
    },
  },
};

export default nextConfig;
```

**What changed:** Added `skipProxyUrlNormalize: true` and fixed the indentation on `cacheComponents`.

#### 4.1 Verify

```bash
npm run dev
```

**Expected:** Dev server starts without warnings. Visit a few routes (`/dashboard`, `/tasks`, `/sign-in`) to confirm everything still works.

---

### Step 5: Fix `any` Types in Test File

> **Why?** ESLint's `no-explicit-any` rule flags `as any` casts. Using proper types makes tests more maintainable and catches type mismatches early.

**File:** `lib/actions/__tests__/auth.test.ts` ← **MODIFY**

There are 12 occurrences of `as any`. Each one casts a mock return value. Replace them with `as unknown` casts (which are type-safe) or more specific types where applicable.

#### 5.1 Replace `as any` with typed alternatives

For mock return values where the exact shape doesn't matter (we just need to satisfy the mock), use `as unknown`:

| Line | Before | After |
|------|--------|-------|
| 58 | `mockResolvedValue({} as any)` | `mockResolvedValue({} as unknown)` |
| 139 | `mockResolvedValue(null as any)` | `mockResolvedValue(null)` |
| 140 | `mockResolvedValue(mockUser as any)` | `mockResolvedValue(mockUser as unknown)` |
| 179 | `mockResolvedValue(null as any)` | `mockResolvedValue(null)` |
| 180 | `mockResolvedValue(null as any)` | `mockResolvedValue(null)` |
| 193 | `mockResolvedValue({ id: "existing-user" } as any)` | `mockResolvedValue({ id: "existing-user" } as unknown)` |
| 207 | `mockResolvedValue(null as any)` | `mockResolvedValue(null)` |
| 228 | `mockResolvedValue(undefined as any)` | `mockResolvedValue(undefined)` |
| 283 | `mockResolvedValue(undefined as any)` | `mockResolvedValue(undefined)` |
| 336 | `mockResolvedValue(undefined as any)` | `mockResolvedValue(undefined)` |
| 395 | `mockResolvedValue(undefined as any)` | `mockResolvedValue(undefined)` |
| 436 | `mockResolvedValue({ ok: true } as any)` | `mockResolvedValue({ ok: true } as unknown)` |

**Pattern:**
- `null as any` → `null` (null doesn't need a cast)
- `undefined as any` → `undefined` (undefined doesn't need a cast)
- `{...} as any` → `{...} as unknown` (satisfies the mock without `any`)

---

### Step 6: Fix `any` Types in Seed Script

> **Why?** The `.map()` callbacks use `any` as the parameter type instead of describing the mock data shape.

**File:** `scripts/seed.ts` ← **MODIFY**

#### 6.1 Define mock data types

Add type definitions before the `seed()` function (after line 17):

```ts
/** Shape of category entries in mock-data.json */
interface MockCategory {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape of task entries in mock-data.json */
interface MockTask {
  id: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### 6.2 Replace `any` with the interfaces

**Before (line 47):**
```ts
const categoriesToInsert = mockData.categories.map((cat: any) => ({
```

**After:**
```ts
const categoriesToInsert = mockData.categories.map((cat: MockCategory) => ({
```

**Before (line 62):**
```ts
const tasksToInsert = mockData.tasks.map((task: any) => ({
```

**After:**
```ts
const tasksToInsert = mockData.tasks.map((task: MockTask) => ({
```

#### 6.3 Verify

```bash
npm run test
```

**Expected:** All tests still pass. No `any` types remain.

---

## 4. File Change Summary

### Files Created
| File | Purpose |
|------|---------|
| `lib/actions/types.ts` | Shared `ActionResult` interface |

### Files Modified
| File | What Changed |
|------|-------------|
| `lib/actions/auth.ts` | Removed local `ActionResult`, import from `types.ts` |
| `lib/actions/task.ts` | Removed local `ActionResult`, import from `types.ts` |
| `lib/actions/category.ts` | Removed local `ActionResult`, import from `types.ts` |
| `lib/actions/settings.ts` | Changed import source to `types.ts` |
| `lib/db/index.ts` | Removed unused `neonConfig` import |
| `components/auth/reset-password-form.tsx` | Removed `FolderOpen`, `ResetPasswordInput` |
| `components/auth/sign-up-form.tsx` | Removed `SignUpInput` |
| `components/auth/verify-email-handler.tsx` | Removed `Controller`, `FolderOpen`, `verifyEmailSchema`, `VerifyEmailInput` |
| `components/settings/appearance-form.tsx` | Removed `Button` |
| `components/settings/preferences-form.tsx` | Removed `useState`, `dateFormatValues`, `defaultSortValues` |
| `components/settings/profile-form.tsx` | Removed `useState` |
| `next.config.ts` | Added `skipProxyUrlNormalize: true` |
| `lib/actions/__tests__/auth.test.ts` | Replaced 12 `as any` casts |
| `scripts/seed.ts` | Added `MockCategory`/`MockTask` interfaces, replaced 2 `any` params |

### Files Deleted
- None

---

## 5. Acceptance Criteria

### Maintainability Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 14 | Duplicated type | `ActionResult` defined only in `lib/actions/types.ts` | ☐ |
| 14 | Duplicated type | All 4 action files import from `types.ts` | ☐ |
| 14 | Duplicated type | No local `ActionResult` definitions remain in action files | ☐ |
| 15 | Unused db import | `neonConfig` removed from `lib/db/index.ts` | ☐ |
| 16 | Unused imports | `reset-password-form.tsx` — `FolderOpen`, `ResetPasswordInput` removed | ☐ |
| 16 | Unused imports | `sign-up-form.tsx` — `SignUpInput` removed | ☐ |
| 16 | Unused imports | `verify-email-handler.tsx` — `Controller`, `FolderOpen`, `verifyEmailSchema`, `VerifyEmailInput` removed | ☐ |
| 16 | Unused imports | `appearance-form.tsx` — `Button` removed | ☐ |
| 16 | Unused imports | `preferences-form.tsx` — `useState`, `dateFormatValues`, `defaultSortValues` removed | ☐ |
| 16 | Unused imports | `profile-form.tsx` — `useState` removed | ☐ |
| 17 | Config | `skipProxyUrlNormalize: true` present in `next.config.ts` | ☐ |
| 18 | `any` types | Zero `as any` in `auth.test.ts` | ☐ |
| 18 | `any` types | Zero `: any` in `scripts/seed.ts` | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero warnings
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] Dev server starts without warnings
- [ ] No runtime behavior changes
- [ ] No new `any` types introduced

---

## 6. Implementation Order

Follow this exact order:

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `lib/actions/types.ts` | 5 min | Create shared `ActionResult` type |
| 2 | 4 action files | 10 min | Import from `types.ts`, remove local definitions |
| 3 | `lib/db/index.ts` | 2 min | Remove unused `neonConfig` import |
| 4 | 7 component files | 10 min | Remove all unused imports |
| 5 | `next.config.ts` | 2 min | Add `skipProxyUrlNormalize: true` |
| 6 | `lib/actions/__tests__/auth.test.ts` | 10 min | Replace 12 `as any` casts |
| 7 | `scripts/seed.ts` | 5 min | Add interfaces, replace 2 `any` params |
| 8 | Build + lint + test | 5 min | `npm run build; npm run lint; npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Removing an import that's actually used | **Medium** | Low | Each removal was verified by searching for usages in the explore step. Run `npm run build` after each file. |
| `skipProxyUrlNormalize` changes routing | **Medium** | Low | Test all routes after adding. Remove it if any issues arise. |
| `as unknown` casts cause type errors in tests | **Low** | Low | `vi.mocked()` returns loosely typed mocks. `unknown` satisfies the constraint. If a specific mock fails, use a targeted interface instead. |
| Removing `ActionResult` export from `auth.ts` breaks external imports | **Low** | Low | Only `settings.ts` imports it, and we update that in the same step. No other file references `ActionResult` from `auth.ts`. |

---

## 8. Related Documentation

- **code-review-report.md** — Suggestions #14, #15, #16, #17, #18
- **P4-F2 FEATURE.md** — Parent feature spec (all 15 suggestions)
- **coding-standards.md** — TypeScript conventions, import rules
- **AGENTS.md** — Next.js 16 `skipProxyUrlNormalize` note
