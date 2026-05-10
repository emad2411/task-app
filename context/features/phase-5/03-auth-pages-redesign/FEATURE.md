# P5-F3: Auth Pages Redesign — Implementation Plan

## Overview

Redesign all public authentication pages from a generic centered-card layout to a bold, brand-first split-screen experience that aligns with TaskFlow's dark-first, Raycast-influenced identity.

**Pages in scope**: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`
**Fidelity**: Production-ready
**Backend changes**: None (purely frontend / presentational)

---

## 1. Design Tokens & Surface Configuration

### 1.1 Color Tokens
All values already exist in `globals.css` and `DESIGN.md`. No new tokens needed.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `bg-background` (`#0d0d0d` in dark) | Page canvas (both panes) |
| `--foreground` | `text-foreground` (`#ededed` in dark) | Primary text, headings |
| `--muted-foreground` | `text-muted-foreground` (`#a8a8a8` in dark) | Sub-copy, labels, placeholders |
| `--border` | `border-border` (`rgba(255,255,255,0.08)` in dark) | Dividers, form area border on desktop |
| `--brand` | `bg-brand` / `text-brand` (`#18E299`) | CTA fill, focus rings, accent glyph |
| `--brand-deep` | `text-brand-deep` (`#0fa76e`) | CTA hover state |
| `--destructive` | `text-destructive` / `bg-destructive` (`#d45656`) | Error text, error borders |

### 1.2 Typography Scale (Brand Pane)

| Element | Size | Weight | Letter-spacing | Line-height |
|---------|------|--------|----------------|-------------|
| Wordmark | `1.5rem` | 700 | `-0.02em` | 1.2 |
| Tagline | `clamp(2rem, 4vw, 3.5rem)` | 800–900 | `-0.03em` | 1.1 |
| Sub-copy | `clamp(1rem, 1.5vw, 1.125rem)` | 400 | normal | 1.5 |
| Caption | `0.875rem` | 400 | normal | 1.5 |

### 1.3 Typography Scale (Form Pane)

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Form title | `1.5rem` | 700 | Only if left pane doesn't carry the headline |
| Input label | `0.875rem` | 500 | Above each field |
| Input text | `1rem` | 400 | Field content |
| Button | `1rem` | 600 | CTA text |
| Link / footer | `0.875rem` | 400–500 | Navigation, legal |

### 1.4 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `space-4` | `16px` | Micro padding inside inputs |
| `space-6` | `24px` | Gap between form fields |
| `space-8` | `32px` | Internal card/pane padding |
| `space-12` | `48px` | Vertical section gaps |
| `space-16` | `64px` | Brand pane internal padding |
| `space-24` | `96px` | Desktop pane separation |

### 1.5 Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-md` | `~8px` | Inputs, small buttons |
| `--radius-lg` | `10px` | Primary CTA, social button |
| `--radius-full` | `9999px` | Pills (if any) |

---

## 2. Component Inventory

### 2.1 New Components to Create

#### `components/auth/split-auth-layout.tsx`
**Purpose**: Shared wrapper for all auth pages. Handles split-screen responsive behavior, brand pane, and entrance animations.

**Props interface**:
```typescript
interface SplitAuthLayoutProps {
  children: ReactNode;              // The form content
  tagline: string;                  // Bold headline for left pane
  subCopy?: string;                 // One-line supporting text
  showDashboardPreview?: boolean;   // Whether to render the dashboard mockup
}
```

**Responsibilities**:
- Render the two-pane layout (brand left, form right)
- Handle responsive collapse at `md` breakpoint (`768px`)
- Orchestrate staggered entrance animations
- Respect `prefers-reduced-motion`
- Render the TaskFlow wordmark + green accent dot
- Render legal footer ("By continuing, you agree to...")

**Implementation notes**:
- Use CSS Grid for desktop: `grid-template-columns: 1fr 1fr` or `45% 55%`
- Use Flexbox column for mobile
- Brand pane: `position: relative`, full height, vertically centered content
- Form pane: `display: flex`, `align-items: center`, `justify-content: center`
- Legal footer: absolute at bottom of form pane, centered, `text-xs`, `text-muted-foreground`

---

#### `components/auth/dashboard-preview.tsx`
**Purpose**: A high-fidelity CSS mockup of the TaskFlow dashboard for the brand pane. Zero external images.

**Visual spec**:
- Dark surface (`bg-card` on `bg-background`)
- Fake sidebar with "TaskFlow" wordmark, nav items (Dashboard, Tasks, Categories)
- Fake task list with 3–4 rows: checkbox + task name + priority badge + due date
- Priority badges: `bg-brand` / `text-brand` for high, muted for normal
- Subtle top bar with search icon and avatar circle
- Rounded corners (`rounded-lg`), subtle border (`border-border`)
- Scale: roughly `320px` wide on desktop, proportionally smaller

**Implementation notes**:
- Pure CSS + HTML — no images, no `next/image`
- Use static content: "Review Q3 report", "Email design team", "Update documentation"
- Add a subtle `shadow-[0_24px_64px_rgba(0,0,0,0.4)]` or `shadow-black/40` for depth
- Slight `transform: perspective(1000px) rotateY(-3deg) rotateX(2deg)` for 3D tilt (optional, test performance)

---

#### `components/auth/google-auth-button.tsx`
**Purpose**: Non-functional Google OAuth button with correct styling and placeholder behavior.

**Props interface**:
```typescript
interface GoogleAuthButtonProps {
  disabled?: boolean;
}
```

**Visual spec**:
- Full width, height `44px`
- Ghost/outline style: `border border-white/12`, transparent background
- Google "G" icon (SVG, 20×20) on the left, "Continue with Google" text centered
- Hover: border lightens to `border-white/20`, background `bg-white/4`
- Active: background `bg-white/8`

**Behavior**:
- On click: `toast.info("Google sign-in coming soon")`
- `cursor: not-allowed` if we want to signal non-functional; otherwise normal cursor with toast

---

#### `components/auth/divider-with-text.tsx`
**Purpose**: "Or continue with email" divider between social and form.

**Visual spec**:
- Horizontal line: `border-t border-border`, full width
- Text centered on top of line: `0.875rem`, `text-muted-foreground`
- Line breaks to the left and right of text with `gap-4` (`16px`) gaps

---

#### `components/auth/brand-pane.tsx`
**Purpose**: Encapsulated left-pane content for reuse across all auth pages.

**Props interface**:
```typescript
interface BrandPaneProps {
  tagline: string;
  subCopy?: string;
  showDashboardPreview?: boolean;
}
```

**Content**:
1. TaskFlow wordmark (Inter 700, `1.5rem`, `text-foreground`) + green dot/checkmark glyph (`text-brand`)
2. Tagline (`clamp(2rem, 4vw, 3.5rem)`, Inter 800–900, `text-foreground`)
3. Sub-copy (if provided, `text-muted-foreground`, max-width `42ch`)
4. Dashboard preview (if enabled)

---

### 2.2 Modified Components

#### `components/auth/auth-card.tsx`
**Change**: Deprecate or repurpose. The Card wrapper is banned. The `AuthCard` component currently wraps forms in a `Card`. Options:
- **Option A**: Remove `AuthCard` entirely. Each page renders `SplitAuthLayout` directly.
- **Option B**: Refactor `AuthCard` to be a thin wrapper that just provides the form-area container (no Card, no shadow, just max-width and padding).

**Decision**: Option A. Delete `AuthCard` and inline the form area styling in `SplitAuthLayout`. The `SuccessCard` variant can be extracted to `components/auth/success-state.tsx`.

---

#### `components/auth/sign-in-form.tsx`
**Changes**:
- Remove `<form>` wrapper margin/padding assumptions — parent layout handles spacing
- Add `GoogleAuthButton` + `DividerWithText` above the email field
- Keep all existing form logic, validation, error handling, and loading states
- Update error banner styling: `bg-destructive/10`, `border border-destructive/20`, `rounded-md`, `p-3`
- Update link styling to match new design system

---

#### `components/auth/sign-up-form.tsx`
**Changes**:
- Same structural changes as `sign-in-form.tsx`
- Add `GoogleAuthButton` + `DividerWithText`
- Success state (`SuccessCard`) should render inside the form pane, not as a modal. The `SplitAuthLayout` wrapper remains, right pane swaps content.
- Extract success state to `components/auth/success-state.tsx` for reuse across verify-email.

---

#### `components/auth/forgot-password-form.tsx`
**Changes**:
- Wrap in `SplitAuthLayout`
- Use brand pane with tagline "Reset your password" + sub-copy
- Keep existing form logic

---

#### `components/auth/reset-password-form.tsx`
**Changes**:
- Wrap in `SplitAuthLayout`
- Use brand pane with tagline "Create a new password"
- Keep existing form logic

---

#### `components/auth/verify-email-handler.tsx`
**Changes**:
- If this page needs visual redesign too, wrap in `SplitAuthLayout`
- Brand pane: "Check your email"
- Right pane: success state with email app button, resend, back link

---

#### `app/(public)/layout.tsx`
**Changes**:
- The current layout centers everything and adds a fixed footer
- **Decision**: Keep `PublicLayout` but make it a minimal flex container. The `SplitAuthLayout` component handles all auth-specific layout. Non-auth public pages (if any) can still use the layout.
- Remove the fixed legal footer from `PublicLayout` — move it into `SplitAuthLayout` so it's part of the auth experience.

---

### 2.3 Deleted Components

- `components/auth/auth-card.tsx` (or refactored to remove Card usage)

---

## 3. Page-by-Page Implementation Plan

### 3.1 `/sign-in` — `app/(public)/sign-in/page.tsx`

**Layout**:
```
<PublicLayout>
  <SplitAuthLayout
    tagline="Your tasks. Your flow."
    subCopy="Sign in to pick up where you left off."
    showDashboardPreview={true}
  >
    <GoogleAuthButton />
    <DividerWithText text="Or continue with email" />
    <SignInForm />
  </SplitAuthLayout>
</PublicLayout>
```

**SignInForm changes**:
- Remove `AuthCard` wrapper
- Add Google button + divider at top
- Remove form title/description (the brand pane handles the headline)
- Keep email, password, forgot password link, submit button, sign-up link

---

### 3.2 `/sign-up` — `app/(public)/sign-up/page.tsx`

**Layout**:
```
<PublicLayout>
  <SplitAuthLayout
    tagline="Start your flow."
    subCopy="Create your account. No credit card required."
    showDashboardPreview={true}
  >
    <GoogleAuthButton />
    <DividerWithText text="Or continue with email" />
    <SignUpForm />
  </SplitAuthLayout>
</PublicLayout>
```

**SignUpForm changes**:
- Remove `AuthCard` wrapper
- Add Google button + divider at top
- Success state: right pane content swaps to `SuccessState` component

---

### 3.3 `/forgot-password` — `app/(public)/forgot-password/page.tsx`

**Layout**:
```
<PublicLayout>
  <SplitAuthLayout
    tagline="Reset your password"
    subCopy="Enter your email and we'll send you a reset link."
    showDashboardPreview={false}
  >
    <ForgotPasswordForm />
    <BackToSignInLink />
  </SplitAuthLayout>
</PublicLayout>
```

---

### 3.4 `/reset-password` — `app/(public)/reset-password/page.tsx`

**Layout**:
```
<PublicLayout>
  <SplitAuthLayout
    tagline="Create a new password"
    subCopy="Choose a strong password you haven't used before."
    showDashboardPreview={false}
  >
    <ResetPasswordForm />
    <BackToSignInLink />
  </SplitAuthLayout>
</PublicLayout>
```

---

### 3.5 `/verify-email` — `app/(public)/verify-email/page.tsx`

**Layout**:
```
<PublicLayout>
  <SplitAuthLayout
    tagline="Check your email"
    subCopy="We've sent you a verification link."
    showDashboardPreview={false}
  >
    <VerifyEmailHandler />
  </SplitAuthLayout>
</PublicLayout>
```

**VerifyEmailHandler changes**:
- Success state: render `SuccessState` with email app button, resend, back link
- Error state: inline error message

---

## 4. Animation & Motion Spec

### 4.1 Desktop Entrance Sequence

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Brand pane container | `opacity: 0 → 1`, `translateY(12px) → 0` | 500ms | 0ms | `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart) |
| Wordmark | Same as above | 400ms | 50ms | ease-out-quart |
| Tagline | Same as above | 500ms | 100ms | ease-out-quart |
| Sub-copy | Same as above | 400ms | 180ms | ease-out-quart |
| Dashboard preview | `opacity: 0 → 1`, `translateY(20px) → 0`, `scale(0.98) → 1` | 600ms | 250ms | ease-out-quart |
| Form pane container | `opacity: 0 → 1`, `translateY(16px) → 0` | 500ms | 100ms | ease-out-quart |
| Form title | Same as above | 400ms | 150ms | ease-out-quart |
| Google button | Same as above | 400ms | 200ms | ease-out-quart |
| Divider | Same as above | 400ms | 240ms | ease-out-quart |
| Email field | Same as above | 400ms | 280ms | ease-out-quart |
| Password field | Same as above | 400ms | 320ms | ease-out-quart |
| Submit button | Same as above | 400ms | 360ms | ease-out-quart |
| Footer links | Same as above | 400ms | 400ms | ease-out-quart |

### 4.2 Mobile Entrance Sequence

Same as desktop but both columns animate together as a single stacked flow. Stagger increments remain `40–80ms`.

### 4.3 `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .auth-animate {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

All animated elements must have this guard.

### 4.4 Implementation Approach

**Option A**: CSS keyframes with inline `animation-delay` per element
**Option B**: Framer Motion with `staggerChildren` and `delayChildren`
**Option C**: Tailwind `animate-in` utilities with custom delays

**Decision**: Option B (Framer Motion) or Option C (Tailwind animate-in). Given the project already uses `tailwindcss-animate` (evidenced by `animate-in zoom-in-50` in `auth-card.tsx`), **Option C** is lower friction. Define custom keyframes in `globals.css`:

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 500ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
```

Use Tailwind arbitrary delays: `animation-delay-[100ms]`, etc.

---

## 5. Responsive Breakpoints

| Breakpoint | Layout | Brand Pane | Form Pane | Dashboard Preview |
|------------|--------|------------|-----------|-------------------|
| `≥1024px` (lg) | 45/55 split | Left, fixed, full height | Right, scrollable if needed | Visible, ~320px wide |
| `≥768px` (md) | 50/50 split | Left, fixed, full height | Right, scrollable if needed | Visible, ~260px wide |
| `<768px` (mobile) | Stacked column | Top, centered, `padding: 48px 24px 32px` | Below, full width, `padding: 0 24px 48px` | Hidden |

**Mobile stack order**:
1. Wordmark
2. Tagline
3. Sub-copy
4. Form content
5. Legal footer

---

## 6. Accessibility Checklist

- [ ] **Focus rings**: `ring-2 ring-brand ring-offset-2` on all interactive elements
- [ ] **Skip link**: Add `SkipToContent` link at top of each auth page (visible on focus)
- [ ] **Heading hierarchy**: One `h1` per page. On desktop, the brand pane tagline is the `h1`. On mobile, same.
- [ ] **Color contrast**: All text meets WCAG AAA (`7:1` for body, `4.5:1` for large text)
- [ ] **Error identification**: Inline errors associated with inputs via `aria-describedby`. Root errors in `role="alert"`.
- [ ] **Form labels**: All inputs have visible labels (not placeholder-only)
- [ ] **Password visibility toggle**: `aria-label="Show password"` / `"Hide password"`
- [ ] **Loading states**: Submit button has `aria-busy="true"` when loading
- [ ] **Reduced motion**: All entrance animations disabled when `prefers-reduced-motion: reduce`

---

## 7. File Structure

```
app/
  (public)/
    layout.tsx                    # Minimal flex wrapper, remove fixed footer
    sign-in/
      page.tsx                    # Use SplitAuthLayout
    sign-up/
      page.tsx                    # Use SplitAuthLayout
    forgot-password/
      page.tsx                    # Use SplitAuthLayout
    reset-password/
      page.tsx                    # Use SplitAuthLayout
    verify-email/
      page.tsx                    # Use SplitAuthLayout

components/
  auth/
    split-auth-layout.tsx         # NEW — Main layout shell
    brand-pane.tsx                # NEW — Left pane content
    dashboard-preview.tsx         # NEW — CSS mockup of app
    google-auth-button.tsx        # NEW — Non-functional Google button
    divider-with-text.tsx         # NEW — "Or continue with email"
    success-state.tsx             # NEW — Extracted from AuthCard/SuccessCard
    back-to-sign-in-link.tsx      # NEW — Reusable "Back to sign in" link
    sign-in-form.tsx              # MODIFIED — Add Google button, remove Card wrapper
    sign-up-form.tsx              # MODIFIED — Add Google button, remove Card wrapper
    forgot-password-form.tsx      # MODIFIED — Remove Card wrapper
    reset-password-form.tsx       # MODIFIED — Remove Card wrapper
    verify-email-handler.tsx      # MODIFIED — Remove Card wrapper
    auth-card.tsx                 # DELETE — Replaced by SplitAuthLayout
```

---

## 8. Copy Reference

### Sign In
- Tagline: "Your tasks. Your flow."
- Sub-copy: "Sign in to pick up where you left off."
- Google button: "Continue with Google"
- Divider: "Or continue with email"
- Forgot password link: "Forgot password?"
- Submit: "Sign In"
- Footer: "Don't have an account? Sign up"

### Sign Up
- Tagline: "Start your flow."
- Sub-copy: "Create your account. No credit card required."
- Google button: "Continue with Google"
- Divider: "Or continue with email"
- Submit: "Create Account"
- Footer: "Already have an account? Sign in"
- Success title: "Check your email"
- Success message: "We've sent a verification link to {email}. Click the link to verify your account."
- Success actions: "Open email app", "Resend email", "Back to Sign In"

### Forgot Password
- Tagline: "Reset your password"
- Sub-copy: "Enter your email and we'll send you a reset link."
- Submit: "Send reset link"
- Footer: "Back to sign in"

### Reset Password
- Tagline: "Create a new password"
- Sub-copy: "Choose a strong password you haven't used before."
- Submit: "Reset password"
- Footer: "Back to sign in"

### Verify Email
- Tagline: "Check your email"
- Sub-copy: "We've sent you a verification link."
- Success actions: "Open email app", "Resend email", "Back to Sign In"

### Legal Footer (all pages)
"By continuing, you agree to our [Terms of Service](/terms) and [Privacy Policy](/privacy)"

---

## 9. Testing Checklist

### Visual
- [ ] Split layout renders correctly at 1440px, 1024px, 768px, 375px
- [ ] Brand pane is hidden on mobile (<768px)
- [ ] Dashboard preview renders without layout shift
- [ ] All animations respect `prefers-reduced-motion`

### Functional
- [ ] Sign-in form submits correctly
- [ ] Sign-up form submits correctly and shows success state
- [ ] Forgot-password form submits correctly
- [ ] Reset-password form submits correctly
- [ ] Verify-email page handles token validation
- [ ] Google button shows toast on click
- [ ] All links navigate correctly (sign-in ↔ sign-up, forgot, terms, privacy)

### Accessibility
- [ ] Keyboard navigation flows through all interactive elements
- [ ] Focus rings visible on all buttons, links, inputs
- [ ] Screen reader announces form errors correctly
- [ ] Color contrast passes WCAG AAA
- [ ] Reduced motion disables animations

### Performance
- [ ] No layout shift on page load (CLS ≈ 0)
- [ ] Dashboard preview is pure CSS (no image downloads)
- [ ] Animation keyframes are GPU-accelerated (`transform`, `opacity` only)

---

## 10. Migration Notes

1. **AuthCard removal**: The `AuthCard` component is used in `sign-in/page.tsx`, `sign-up/page.tsx`, and potentially `forgot-password/page.tsx`, `reset-password/page.tsx`, `verify-email/page.tsx`. Remove all imports and replace with `SplitAuthLayout`.

2. **PublicLayout cleanup**: Remove the fixed footer from `PublicLayout`. The legal text moves into `SplitAuthLayout`.

3. **SuccessCard extraction**: The `SuccessCard` inside `auth-card.tsx` should be extracted to `components/auth/success-state.tsx` and imported by `sign-up-form.tsx` and `verify-email-handler.tsx`.

4. **No database changes**: This is a pure frontend refactor.

5. **No auth logic changes**: All `signInAction`, `signUpAction`, form validation schemas, and session handling remain untouched.

---

## 11. Open Questions for Implementer

1. **Dashboard preview detail level**: Should the CSS mockup include a fake chart/graph in the dashboard preview, or keep it to task list only?
2. **Google button icon**: Use a simple inline SVG Google "G" or import from `lucide-react` (no Google icon exists in lucide — an inline SVG is required).
3. **Framer Motion dependency**: The project does not currently list `framer-motion` in dependencies. Should we add it, or stick to Tailwind CSS animations?
4. **Brand pane background texture**: Plain `bg-background`, or a very subtle gradient/noise texture for depth?
5. **Form pane background on desktop**: Same `bg-background` as brand pane, or a slightly lighter surface (`bg-muted` or `bg-card`) to create separation?

---

*Brief confirmed by user. Plan generated by `impeccable shape`.*
