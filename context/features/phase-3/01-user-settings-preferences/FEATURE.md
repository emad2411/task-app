# Feature Specification: P3-F1 - User Settings & Preferences

**Phase:** 3 - Preferences and Polish  
**Feature ID:** P3-F1  
**Feature Name:** User Settings & Preferences  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-24

---

## 1. Goals

### Primary Goal
Build a comprehensive `/settings` page that allows authenticated users to manage their profile, security credentials, appearance preferences, and application behavior. Replace the current placeholder settings page with a fully functional, tabbed settings experience.

### Secondary Goals
- Allow users to update their display name
- Allow users to change their password from a dedicated security section
- Persist theme preference (light/dark/system) to the database via `user_preferences`
- Allow users to set timezone, date format, and default task sort order
- Automatically create a `user_preferences` record on first visit if none exists
- Ensure all preferences are reflected across the application immediately after save
- Provide a polished, accessible, mobile-responsive settings UI

---

## 2. Scope

### In Scope

#### Settings Sections
1. **Profile** — Update display name (and optionally avatar URL)
2. **Security** — Change password (current + new), sign out
3. **Appearance** — Theme selection (light/dark/system) synced to DB
4. **Preferences** — Timezone, date format, default task sort order

#### Data Layer
1. **`lib/data/preferences.ts`** — CRUD for `user_preferences` table
2. **`lib/actions/settings.ts`** — Server actions for profile update, preferences update
3. **`lib/validation/settings.ts`** — Zod v4 schemas for all settings forms

#### Components
1. **`components/settings/settings-tabs.tsx`** — Tab navigation (Client Component)
2. **`components/settings/profile-form.tsx`** — Display name form (Client Component)
3. **`components/settings/security-form.tsx`** — Change password form (Client Component)
4. **`components/settings/appearance-form.tsx`** — Theme selector (Client Component)
5. **`components/settings/preferences-form.tsx`** — Timezone, date format, sort order (Client Component)

#### Page Updates
1. **`app/(app)/settings/page.tsx`** — Full settings page with tabs
2. **`app/(app)/settings/loading.tsx`** — Loading skeleton
3. **`app/(app)/settings/error.tsx`** — Error boundary

### Out of Scope
- Avatar image upload (MVP uses URL string only if at all)
- Session management / revoke other sessions (post-MVP)
- Account deletion (post-MVP)
- Notification preferences (post-MVP)
- Export/import user data (post-MVP)
- Two-factor authentication (post-MVP)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Profile Settings
**Priority:** P0  
**Description:** Allow users to update their display name

**Acceptance Criteria:**
- [ ] Display current name pre-filled in input
- [ ] Name field required, min 2 chars, max 100 chars
- [ ] Submit updates `users.name` via Better Auth `updateUser` API or direct DB update
- [ ] Success toast shown on save
- [ ] Sidebar/header user name updates after save (revalidation)
- [ ] Loading state on submit button

#### REQ-002: Change Password
**Priority:** P0  
**Description:** Allow users to change their password from settings

**Acceptance Criteria:**
- [ ] Form fields: current password, new password, confirm new password
- [ ] Reuses existing `updatePasswordAction` from `lib/actions/auth.ts`
- [ ] Reuses existing `updatePasswordSchema` from `lib/validation/auth.ts`
- [ ] Shows error if current password is incorrect
- [ ] Shows error if new passwords don't match (client-side)
- [ ] Password requirements: min 8 chars
- [ ] Success toast and form reset on success
- [ ] Loading state on submit button

#### REQ-003: Theme Preference
**Priority:** P0  
**Description:** Allow users to select and persist their theme preference

**Acceptance Criteria:**
- [ ] Three options: Light, Dark, System (with visual preview cards or radio group)
- [ ] Current selection highlighted
- [ ] Selecting a theme applies it immediately (via existing ThemeProvider)
- [ ] Theme choice persisted to `user_preferences.theme` in database
- [ ] On page load, theme loaded from DB preference (not just localStorage)
- [ ] Falls back to `system` if no preference record exists

#### REQ-004: Timezone Preference
**Priority:** P1  
**Description:** Allow users to set their timezone for date calculations

**Acceptance Criteria:**
- [ ] Searchable timezone selector (combobox) with common timezones
- [ ] Current timezone pre-selected
- [ ] Default: `UTC` if no preference exists
- [ ] Saved to `user_preferences.timezone`
- [ ] Used by dashboard and task date calculations (already partially supported in `lib/utils/date.ts`)

#### REQ-005: Date Format Preference
**Priority:** P1  
**Description:** Allow users to choose how dates are displayed

**Acceptance Criteria:**
- [ ] Options: `MM/dd/yyyy`, `dd/MM/yyyy`, `yyyy-MM-dd`, `MMM d, yyyy`
- [ ] Preview of selected format shown with today's date
- [ ] Saved to `user_preferences.dateFormat`
- [ ] Default: `MM/dd/yyyy`

#### REQ-006: Default Task Sort Preference
**Priority:** P2  
**Description:** Allow users to set their default sort order for the tasks page

**Acceptance Criteria:**
- [ ] Options match task sort fields: Due Date, Created Date, Updated Date, Priority, Title
- [ ] Direction: Ascending / Descending
- [ ] Saved to `user_preferences.defaultTaskSort` as `field_direction` format (e.g., `due_date_asc`)
- [ ] Tasks page uses this as default when no URL sort params are present

#### REQ-007: Auto-create Preferences Record
**Priority:** P0  
**Description:** Ensure every user has a preferences record

**Acceptance Criteria:**
- [ ] On settings page load, if no `user_preferences` record exists for the user, create one with defaults
- [ ] Use upsert pattern to avoid race conditions
- [ ] Defaults: `theme=system`, `timezone=UTC`, `dateFormat=MM/dd/yyyy`, `defaultTaskSort=due_date_asc`

### 3.2 Technical Requirements

#### REQ-008: Data Layer
**Priority:** P0  
**Description:** Preferences data access functions

**Acceptance Criteria:**
- [ ] `getUserPreferences(userId)` — returns preferences or null
- [ ] `upsertUserPreferences(userId, data)` — create or update
- [ ] All queries scoped by `userId`
- [ ] Returns typed `UserPreferences` from schema

#### REQ-009: Validation Schemas
**Priority:** P0  
**Description:** Zod v4 schemas for settings forms

**Acceptance Criteria:**
- [ ] `updateProfileSchema` — `{ name: z.string().min(2).max(100).trim() }`
- [ ] `updatePreferencesSchema` — theme, timezone, dateFormat, defaultTaskSort with proper enums
- [ ] Change password reuses existing `updatePasswordSchema`
- [ ] Invalid values rejected with clear error messages

#### REQ-010: Server Actions
**Priority:** P0  
**Description:** Server actions for settings mutations

**Acceptance Criteria:**
- [ ] `updateProfileAction(input)` — updates user name via Better Auth or direct DB
- [ ] `updatePreferencesAction(input)` — upserts user_preferences record
- [ ] Both return `{ success, data?, error? }` pattern
- [ ] Both require authenticated user (`requireUserId()`)
- [ ] Revalidate relevant paths after mutation

#### REQ-011: Page Architecture
**Priority:** P0  
**Description:** Settings page structure

**Acceptance Criteria:**
- [ ] `app/(app)/settings/page.tsx` is an async Server Component
- [ ] Fetches user session + preferences on load
- [ ] Passes data to client-side tabbed form components
- [ ] Tab state managed via URL hash or query param (`?tab=profile`)
- [ ] Loading skeleton matches tab layout
- [ ] Error boundary with retry

#### REQ-012: Responsive Design
**Priority:** P0  
**Description:** Settings usable on all screen sizes

**Acceptance Criteria:**
- [ ] Mobile: tabs render as a vertical list or horizontal scroll
- [ ] Desktop: sidebar tabs on left, content on right (or top tabs with content below)
- [ ] Forms are single-column and comfortably spaced
- [ ] All inputs have proper label associations
- [ ] Touch targets ≥ 44px on mobile

---

## 4. UI Architecture

### 4.1 File Structure

```
app/(app)/
├── settings/
│   ├── page.tsx                  # SettingsPage (Server Component)
│   ├── loading.tsx               # SettingsLoading skeleton
│   └── error.tsx                 # SettingsError boundary

components/settings/
├── settings-tabs.tsx             # SettingsTabs (Client Component) - tab navigation
├── profile-form.tsx              # ProfileForm (Client Component)
├── security-form.tsx             # SecurityForm (Client Component)
├── appearance-form.tsx           # AppearanceForm (Client Component)
├── preferences-form.tsx          # PreferencesForm (Client Component)
└── timezone-combobox.tsx         # TimezoneCombobox (Client Component) - searchable

lib/
├── data/
│   └── preferences.ts            # getUserPreferences, upsertUserPreferences
├── actions/
│   └── settings.ts               # updateProfileAction, updatePreferencesAction
├── validation/
│   └── settings.ts               # updateProfileSchema, updatePreferencesSchema
└── utils/
    └── timezones.ts              # Timezone list constant
```

### 4.2 Component Hierarchy

```
SettingsPage (Server Component)
├── requireAuth() → session
├── getUserPreferences(userId) → preferences (auto-create if null)
├── PageHeader: "Settings"
└── SettingsTabs (Client Component)
    ├── Tab: Profile
    │   └── ProfileForm
    │       ├── Name input (pre-filled)
    │       └── Save button
    ├── Tab: Security
    │   └── SecurityForm
    │       ├── Current password
    │       ├── New password
    │       ├── Confirm password
    │       └── Update password button
    ├── Tab: Appearance
    │   └── AppearanceForm
    │       ├── Theme cards (Light / Dark / System)
    │       └── Save button
    └── Tab: Preferences
        └── PreferencesForm
            ├── Timezone combobox
            ├── Date format select
            ├── Default sort select + direction
            └── Save button
```

### 4.3 Page Layout

```
Desktop (1024px+):
+-------------------------------------------------------+
| Settings                                               |
+-------------------------------------------------------+
| [Profile] [Security] [Appearance] [Preferences]        |
+-------------------------------------------------------+
| Profile                                                |
| ─────────────────────────────────────────────          |
|                                                        |
| Display Name                                           |
| [John Doe                              ]               |
|                                                        |
|                              [Save Changes]            |
+-------------------------------------------------------+

Mobile (<640px):
+---------------------------+
| Settings                  |
+---------------------------+
| Profile ▸ Security ▸ ...  |
+---------------------------+
| Profile                   |
| ────────────────────────  |
|                           |
| Display Name              |
| [John Doe            ]    |
|                           |
|         [Save Changes]    |
+---------------------------+
```

### 4.4 Appearance Tab Layout

```
+-------------------------------------------------------+
| Appearance                                             |
| Choose your preferred theme                            |
| ─────────────────────────────────────────────          |
|                                                        |
| +──────────+  +──────────+  +──────────+               |
| |  ☀ Light |  |  🌙 Dark |  |  💻 System|              |
| |          |  |  ●       |  |          |               |
| +──────────+  +──────────+  +──────────+               |
|                                                        |
|                              [Save Changes]            |
+-------------------------------------------------------+
```

---

## 5. Design Specifications

### 5.1 Visual Design

#### Settings Tabs
- Use shadcn/ui `Tabs` component
- Desktop: horizontal tabs, full width
- Mobile: horizontal scrollable tabs or `ScrollArea`
- Active tab: `border-b-2 border-primary`

#### Form Cards
- Each section wrapped in a subtle card/container
- Section title: `text-lg font-semibold`
- Section description: `text-sm text-muted-foreground`
- Form inputs: consistent spacing `space-y-4`
- Submit button: right-aligned, `variant="default"`

#### Theme Selection Cards
- Three cards in a row (grid-cols-3)
- Each card: `border rounded-lg p-4 cursor-pointer`
- Selected: `border-primary ring-2 ring-primary/20`
- Unselected: `border-border hover:border-muted-foreground/50`
- Icon + label centered in each card

### 5.2 Spacing & Typography
- Page title: `text-2xl font-bold tracking-tight`
- Section heading: `text-lg font-semibold`
- Section description: `text-sm text-muted-foreground`
- Form labels: `text-sm font-medium`
- Input fields: `h-10`, standard shadcn/ui Input
- Buttons: `h-10`, shadcn/ui Button

---

## 6. Data Queries & Actions

### 6.1 Data Layer

```typescript
// lib/data/preferences.ts
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get user preferences, returns null if no record exists
 */
export async function getUserPreferences(userId: string) {
  return db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(
  userId: string,
  data: Partial<{
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: string;
    defaultTaskSort: string;
  }>
) {
  const existing = await getUserPreferences(userId);

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(userPreferences)
    .values({
      userId,
      theme: data.theme ?? "system",
      timezone: data.timezone ?? "UTC",
      dateFormat: data.dateFormat ?? "MM/dd/yyyy",
      defaultTaskSort: data.defaultTaskSort ?? "due_date_asc",
    })
    .returning();
  return created;
}
```

### 6.2 Validation Schemas

```typescript
// lib/validation/settings.ts
import { z } from "zod";

export const themeValues = ["light", "dark", "system"] as const;
export const dateFormatValues = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "MMM d, yyyy",
] as const;
export const defaultSortValues = [
  "due_date_asc",
  "due_date_desc",
  "created_at_desc",
  "created_at_asc",
  "updated_at_desc",
  "priority_desc",
  "priority_asc",
  "title_asc",
  "title_desc",
] as const;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(themeValues).optional(),
  timezone: z.string().min(1).optional(),
  dateFormat: z.enum(dateFormatValues).optional(),
  defaultTaskSort: z.enum(defaultSortValues).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
```

### 6.3 Server Actions

```typescript
// lib/actions/settings.ts
"use server";

import { requireUserId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { upsertUserPreferences } from "@/lib/data/preferences";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  type UpdateProfileInput,
  type UpdatePreferencesInput,
} from "@/lib/validation/settings";

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const userId = await requireUserId();
    const validated = updateProfileSchema.parse(input);

    await db
      .update(users)
      .set({ name: validated.name, updatedAt: new Date() })
      .where(eq(users.id, userId));

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: { message: "Profile updated" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}

export async function updatePreferencesAction(input: UpdatePreferencesInput) {
  try {
    const userId = await requireUserId();
    const validated = updatePreferencesSchema.parse(input);

    await upsertUserPreferences(userId, validated);

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");

    return { success: true, data: { message: "Preferences updated" } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update preferences" };
  }
}
```

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Settings | `/settings` | Loads user data, renders tabbed forms |
| Loading | `/settings` | Skeleton matches tab layout |
| Error | `/settings` | Friendly error with retry |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Profile | Update name succeeds and reflects in sidebar |
| Profile | Empty/short name rejected client-side |
| Password | Change password with correct current password succeeds |
| Password | Wrong current password shows error |
| Password | Mismatched new passwords rejected client-side |
| Theme | Selecting dark theme applies immediately |
| Theme | Theme persists across page refresh (from DB) |
| Timezone | Selecting timezone saves to preferences |
| Date Format | Selecting format shows preview with today's date |
| Sort Default | Selected default sort used on `/tasks` when no URL params |
| Auto-create | First visit creates preferences record |

---

## 8. Testing Strategy

### Unit Tests

**Validation (`lib/validation/__tests__/settings.test.ts`)**
- [ ] `updateProfileSchema` accepts valid name
- [ ] `updateProfileSchema` rejects name < 2 chars
- [ ] `updateProfileSchema` rejects name > 100 chars
- [ ] `updateProfileSchema` trims whitespace
- [ ] `updatePreferencesSchema` accepts valid theme enum
- [ ] `updatePreferencesSchema` rejects invalid theme
- [ ] `updatePreferencesSchema` accepts valid dateFormat
- [ ] `updatePreferencesSchema` accepts valid defaultTaskSort
- [ ] `updatePreferencesSchema` all fields optional

**Server Actions (`lib/actions/__tests__/settings.test.ts`)**
- [ ] `updateProfileAction` validates input
- [ ] `updateProfileAction` updates user name in DB
- [ ] `updateProfileAction` requires authentication
- [ ] `updatePreferencesAction` upserts preferences
- [ ] `updatePreferencesAction` requires authentication
- [ ] `updatePreferencesAction` creates record if none exists

**Data Layer (`lib/data/__tests__/preferences.test.ts`)**
- [ ] `getUserPreferences` returns null for missing user
- [ ] `upsertUserPreferences` creates new record with defaults
- [ ] `upsertUserPreferences` updates existing record

### Manual Testing Checklist

#### Profile
- [ ] Name pre-filled with current value
- [ ] Update name, verify sidebar updates
- [ ] Try empty name, verify error shown

#### Security
- [ ] Change password with correct current password
- [ ] Try wrong current password, verify error
- [ ] Try mismatched new passwords, verify error
- [ ] After password change, sign out and sign in with new password

#### Appearance
- [ ] Select Light theme, verify immediate change
- [ ] Select Dark theme, verify immediate change
- [ ] Select System theme, verify follows OS preference
- [ ] Refresh page, verify theme persists

#### Preferences
- [ ] Search and select timezone
- [ ] Select date format, verify preview
- [ ] Select default sort, verify `/tasks` uses it
- [ ] Refresh page, verify all preferences persist

#### Responsive
- [ ] Mobile (320px): tabs scrollable, forms comfortable
- [ ] Tablet (768px): good spacing
- [ ] Desktop (1024px): proper layout

---

## 9. Implementation Notes

### Dependencies Already Installed
- `drizzle-orm` — Database queries
- `zod` — Validation (v4)
- `react-hook-form` + `@hookform/resolvers` — Form management
- `lucide-react` — Icons (User, Lock, Palette, Settings, Sun, Moon, Monitor)
- shadcn/ui components: Input, Button, Tabs, Select, Card, Label, Separator, Sonner (toast)

### Potentially Needed shadcn/ui Components
- `Command` / `Popover` — for timezone combobox (check if already installed)
- `RadioGroup` — for theme selection alternative
- `Separator` — section dividers

### Existing Code to Reuse
- `updatePasswordAction` from `lib/actions/auth.ts` — reuse directly for password change
- `updatePasswordSchema` from `lib/validation/auth.ts` — reuse for password form validation
- `ThemeProvider` from `components/layout/theme-provider.tsx` — already wraps the app
- `useTheme` from `next-themes` — use in AppearanceForm for immediate theme application
- `themePreferenceEnum` from `lib/db/schema.ts` — already defined in DB schema

### Theme Sync Strategy
1. AppearanceForm calls `setTheme()` from `next-themes` for immediate visual change
2. Simultaneously calls `updatePreferencesAction` to persist to DB
3. On app load, the Server Component reads DB preference and passes as `defaultTheme` to ThemeProvider
4. This ensures theme persists across devices (DB) and applies instantly (client)

### Timezone List
- Use `Intl.supportedValuesOf('timeZone')` for the canonical timezone list
- Group by region (America, Europe, Asia, etc.) for the combobox
- Store the IANA timezone string (e.g., `America/New_York`)

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Theme flicker on load (FOUC) | Medium | Use `next-themes` suppressHydrationWarning + DB default passed to ThemeProvider |
| Timezone list too long for mobile | Low | Use searchable combobox with type-ahead |
| Better Auth `updateUser` API differences | Medium | Check docs; fallback to direct Drizzle update on `users` table |
| Race condition on upsert | Low | Use `ON CONFLICT DO UPDATE` or check-then-insert with retry |
| Date format not applied everywhere | Medium | Create a shared `formatDate(date, userPrefs)` utility |

---

## 11. Related Documentation

- **PRD.md** §6.6 — User Settings and Preferences requirements
- **PRD.md** §12 — Application behaviors: settings rules
- **coding-standards.md** — TypeScript, React, Tailwind v4, database conventions
- **ai-interaction.md** — Workflow for implementation
- **lib/db/schema.ts** — `userPreferences` table, `themePreferenceEnum`
- **lib/actions/auth.ts** — Existing `updatePasswordAction`
- **lib/validation/auth.ts** — Existing `updatePasswordSchema`
- **components/layout/theme-provider.tsx** — Existing ThemeProvider

---

## 12. Definition of Done

- [ ] Profile form updates user display name
- [ ] Change password form works using existing `updatePasswordAction`
- [ ] Theme selector applies theme immediately and persists to DB
- [ ] Timezone selector saves to preferences
- [ ] Date format selector saves to preferences with live preview
- [ ] Default task sort saves to preferences
- [ ] Preferences auto-created on first settings page visit
- [ ] All forms have loading states and success/error toasts
- [ ] Tabbed navigation works on mobile and desktop
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode works correctly on all form elements
- [ ] Accessibility: keyboard navigable, labels associated
- [ ] Build passes (`npm run build`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Manual testing checklist complete

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P3-F1-user-settings-preferences`
3. Implement in order: Validation schemas → Data layer → Server actions → Components (ProfileForm → SecurityForm → AppearanceForm → PreferencesForm → SettingsTabs) → Page integration → Testing
4. Test thoroughly
5. Build and commit
