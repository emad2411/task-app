# Feature Specification: P2-F1 - Auth Pages UI

**Phase:** 2 - Core Product  
**Feature ID:** P2-F1  
**Feature Name:** Auth Pages UI  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-20

---

## 1. Goals

### Primary Goal
Build a complete, polished, and accessible authentication UI that connects the existing backend auth system (Better Auth, Server Actions) to user-facing forms, handling all authentication flows with excellent UX.

### Secondary Goals
- Provide clear visual feedback for all auth states (loading, success, error)
- Implement mobile-first responsive design for auth pages
- Ensure all auth flows have proper success/instructions states
- Create a consistent brand experience across all public pages
- Validate all forms with Zod before submission
- Prevent duplicate submissions and show loading states

---

## 2. Scope

### In Scope

#### Core Public Routes (in `app/(public)/` route group)
1. **`/sign-in`** - Login form with email/password
2. **`/sign-up`** - Registration form with name, email, password
3. **`/forgot-password`** - Password reset request form
4. **`/reset-password`** - New password form (token from URL)
5. **`/verify-email`** - Email verification callback handler

#### Success & Interstitial States (CRITICAL)
1. **Post-Registration Success UI** - "Check your email" view after successful signup
2. **Post-Password Reset Success UI** - Confirmation view after password change
3. **Email Verification States** - Loading, success, and error states for verification

#### UX/UI Requirements
1. Loading states with disabled buttons and spinners
2. Inline field-level error handling (Zod validation)
3. Toast notifications for server errors and success messages
4. Responsive design using Tailwind CSS v4
5. Mobile-first layout optimized for all screen sizes
6. Keyboard navigation support (tab order, focus states)
7. Form accessibility (proper labels, aria attributes)

### Out of Scope
- Email template modifications (already implemented in P1-F6)
- Server action logic (already implemented in P1-F4)
- Better Auth configuration (already implemented in P1-F3)
- Database schema changes (already complete)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Sign-In Page
**Priority:** P0  
**Description:** Implement the sign-in form UI

**Acceptance Criteria:**
- [ ] Page displays at `/sign-in` route
- [ ] Form includes email and password fields
- [ ] Email field uses `type="email"` with proper keyboard on mobile
- [ ] Password field uses `type="password"` with toggle to show/hide
- [ ] Form uses React Hook Form with `signInSchema` validation
- [ ] Submit button shows "Sign In" text and loading spinner when pending
- [ ] On validation error, inline error appears below field
- [ ] On server error, toast notification displays with error message
- [ ] On success, user is redirected to `/dashboard`
- [ ] Link to "Forgot password?" page
- [ ] Link to "Sign up" page for new users
- [ ] Already-authenticated users are redirected to `/dashboard`

#### REQ-002: Sign-Up Page
**Priority:** P0  
**Description:** Implement the registration form UI

**Acceptance Criteria:**
- [ ] Page displays at `/sign-up` route
- [ ] Form includes name, email, and password fields
- [ ] Name field uses `type="text"` with auto-capitalize on mobile
- [ ] Password field shows strength indicator (minimum 8 characters)
- [ ] Form uses React Hook Form with `signUpSchema` validation
- [ ] Submit button shows "Create Account" text and loading spinner when pending
- [ ] On validation error, inline error appears below field
- [ ] On server error, toast notification displays with error message
- [ ] On success, display **Post-Registration Success UI** (REQ-009)
- [ ] Link to "Already have an account? Sign In"
- [ ] Already-authenticated users are redirected to `/dashboard`

#### REQ-003: Forgot Password Page
**Priority:** P0  
**Description:** Implement password reset request form

**Acceptance Criteria:**
- [ ] Page displays at `/forgot-password` route
- [ ] Form includes email field only
- [ ] Form uses React Hook Form with `forgotPasswordSchema` validation
- [ ] Submit button shows "Send Reset Link" and loading spinner when pending
- [ ] On success, show success message: "If an account exists with this email, you will receive a password reset link"
- [ ] Success message does NOT reveal if email exists (security)
- [ ] Link to "Back to Sign In"
- [ ] Already-authenticated users are redirected to `/dashboard`

#### REQ-004: Reset Password Page
**Priority:** P0  
**Description:** Implement new password form

**Acceptance Criteria:**
- [ ] Page displays at `/reset-password` route
- [ ] Reads `token` query parameter from URL: `?token=xxx`
- [ ] If token is missing, show error state with link to forgot-password
- [ ] Form includes new password and confirm password fields
- [ ] Passwords must match (client-side validation in addition to Zod)
- [ ] Form uses React Hook Form with `resetPasswordSchema` validation
- [ ] Submit button shows "Reset Password" and loading spinner when pending
- [ ] On success, display **Post-Password Reset Success UI** (REQ-010)
- [ ] On error (invalid/expired token), show error with link to request new reset

#### REQ-005: Verify Email Page
**Priority:** P0  **Description:** Implement email verification callback handler

**Acceptance Criteria:**
- [ ] Page displays at `/verify-email` route  
- [ ] Reads `token` query parameter from URL: `?token=xxx`
- [ ] On mount, automatically attempts verification with loading state
- [ ] Shows loading spinner while verification is in progress
- [ ] On success, display success message with CTA to sign in
- [ ] On error (invalid/expired token), show error with option to resend
- [ ] Includes "Resend verification email" form (email input + submit)

#### REQ-006: Public Layout
**Priority:** P0  
**Description:** Consistent layout for all public auth pages

**Acceptance Criteria:**
- [ ] Uses existing `app/(public)/layout.tsx`
- [ ] Centered card-based layout with max-width constraint
- [ ] App logo/branding at top of card
- [ ] Subtle background pattern or gradient (optional but nice)
- [ ] Footer with links to terms/privacy (placeholder links OK)
- [ ] Theme-aware (respects dark/light mode)

#### REQ-007: Form Validation & Error Handling
**Priority:** P0  
**Description:** Comprehensive validation and error display

**Acceptance Criteria:**
- [ ] All forms use React Hook Form with Zod resolver
- [ ] Client-side validation triggers on blur for touched fields
- [ ] Inline error messages appear below fields with red styling
- [ ] Server errors display via toast notification using `sonner`
- [ ] Form state persists during submission (no data loss)
- [ ] Submit buttons disable during submission
- [ ] Password fields support visibility toggle

#### REQ-008: Loading States
**Priority:** P0  
**Description:** Clear loading indicators during async operations

**Acceptance Criteria:**
- [ ] All submit buttons show loading spinner when `isPending` is true
- [ ] Buttons are disabled during submission
- [ ] Form fields are NOT disabled during submission (allow user to see input)
- [ ] Loading spinners use `Loader2` icon with animation
- [ ] Success toasts auto-dismiss after 4 seconds
- [ ] Error toasts require manual dismissal or persist longer

#### REQ-009: Post-Registration Success UI
**Priority:** P0  
**Description:** Success view shown after successful signup

**Acceptance Criteria:**
- [ ] Replaces the sign-up form on successful registration
- [ ] Shows success icon (checkmark in circle)
- [ ] Displays heading: "Check your email"
- [ ] Displays message: "We've sent a verification link to [email]. Click the link to verify your account."
- [ ] Includes "Open email app" button (mailto link)
- [ ] Includes secondary text: "Didn't receive it? Check your spam folder or"
- [ ] Includes "Resend email" button that triggers resend action
- [ ] Includes "Back to Sign In" link at bottom
- [ ] Persists on refresh (read email from query param or localStorage)

#### REQ-010: Post-Password Reset Success UI
**Priority:** P0  
**Description:** Success view shown after password reset

**Acceptance Criteria:**
- [ ] Replaces the reset password form on successful reset
- [ ] Shows success icon (checkmark in circle)
- [ ] Displays heading: "Password Reset Successful"
- [ ] Displays message: "Your password has been updated. You can now sign in with your new password."
- [ ] Primary CTA button: "Sign In" that navigates to `/sign-in`
- [ ] Auto-redirect to `/sign-in` after 5 seconds (optional enhancement)

#### REQ-011: Already Authenticated Redirect
**Priority:** P1  
**Description:** Redirect logged-in users away from auth pages

**Acceptance Criteria:**
- [ ] All public auth pages check session on load
- [ ] If user is authenticated, redirect to `/dashboard`
- [ ] No flash of auth page before redirect (use loading state)
- [ ] Redirect preserves query params if needed (rare for auth)

### 3.2 Technical Requirements

#### REQ-012: Component Architecture
**Priority:** P0  
**Description:** Well-organized component structure

**Acceptance Criteria:**
- [ ] Create `components/auth/sign-in-form.tsx` - Sign in form component
- [ ] Create `components/auth/sign-up-form.tsx` - Sign up form component
- [ ] Create `components/auth/forgot-password-form.tsx` - Forgot password form
- [ ] Create `components/auth/reset-password-form.tsx` - Reset password form
- [ ] Create `components/auth/verify-email-handler.tsx` - Email verification logic
- [ ] Create `components/auth/success-card.tsx` - Reusable success state card
- [ ] Create `components/auth/auth-card.tsx` - Wrapper card with logo/branding
- [ ] All components are Client Components (`'use client'`)
- [ ] Components use TypeScript with proper prop interfaces

#### REQ-013: Form Integration
**Priority:** P0  
**Description:** Proper integration with existing server actions

**Acceptance Criteria:**
- [ ] Sign in form calls `signInAction` from `lib/actions/auth.ts`
- [ ] Sign up form calls `signUpAction` from `lib/actions/auth.ts`
- [ ] Forgot password form calls `forgotPasswordAction` from `lib/actions/auth.ts`
- [ ] Reset password form calls `resetPasswordAction` from `lib/actions/auth.ts`
- [ ] Verify email calls `verifyEmailAction` from `lib/actions/auth.ts`
- [ ] All actions use `useTransition` or `useActionState` for pending states
- [ ] All actions handle the `{ success, data?, error? }` response pattern

#### REQ-014: Styling Requirements
**Priority:** P0  
**Description:** Consistent with design system

**Acceptance Criteria:**
- [ ] Use Tailwind CSS v4 syntax (no arbitrary values)
- [ ] Use existing shadcn/ui components:
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Button` with proper variants
  - `Input` for text fields
  - `Label` for field labels
  - `Alert` for error states
- [ ] Support dark mode via existing CSS variables
- [ ] Mobile-first responsive breakpoints:
  - Default: Mobile (320px+)
  - `sm`: 640px+ (small tablets)
  - `md`: 768px+ (tablets)
  - `lg`: 1024px+ (desktops)

#### REQ-015: Accessibility Requirements
**Priority:** P0  
**Description:** WCAG-compliant forms

**Acceptance Criteria:**
- [ ] All inputs have associated `<label>` elements
- [ ] Error messages linked via `aria-describedby`
- [ ] Required fields marked with `aria-required` or `required` attribute
- [ ] Focus visible styles use existing ring utilities
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] Form can be completed with keyboard only
- [ ] Focus trap in modal dialogs (if using)

### 3.3 Non-Functional Requirements

#### REQ-016: Performance
- [ ] Form components lazy load if possible
- [ ] No layout shift during loading states
- [ ] Images (logo) optimized and sized

#### REQ-017: Security
- [ ] No sensitive data logged to console
- [ ] Password fields never show in plain text by default
- [ ] Token values not logged
- [ ] CSRF protection handled by Better Auth (already configured)

---

## 4. UI Architecture

### 4.1 Page Structure

```
app/(public)/
├── layout.tsx              # Centered flex layout
├── sign-in/
│   └── page.tsx            # SignInPage (Server Component)
├── sign-up/
│   └── page.tsx            # SignUpPage (Server Component)
├── forgot-password/
│   └── page.tsx            # ForgotPasswordPage (Server Component)
├── reset-password/
│   └── page.tsx            # ResetPasswordPage (Server Component)
└── verify-email/
    └── page.tsx            # VerifyEmailPage (Server Component)

components/auth/
├── sign-in-form.tsx        # SignInForm (Client Component)
├── sign-up-form.tsx        # SignUpForm (Client Component)
├── forgot-password-form.tsx # ForgotPasswordForm (Client Component)
├── reset-password-form.tsx # ResetPasswordForm (Client Component)
├── verify-email-handler.tsx # VerifyEmailHandler (Client Component)
├── success-card.tsx        # Reusable success UI (Client Component)
└── auth-card.tsx           # Branded card wrapper (Client Component)
```

### 4.2 Component Hierarchy

```
PublicLayout
└── AuthCard
    ├── Logo/Branding
    ├── CardHeader (Title + Description)
    └── CardContent
        ├── SignInForm / SignUpForm / ForgotPasswordForm / ResetPasswordForm
        │   ├── Form (react-hook-form)
        │   │   ├── FormField (email, password, etc.)
        │   │   └── SubmitButton (with loading state)
        │   └── Links (Forgot password, Sign up, etc.)
        └── SuccessCard (conditional)
            ├── SuccessIcon
            ├── Heading
            ├── Message
            └── Actions
```

### 4.3 State Management

#### Local Component State
- Form state: Managed by React Hook Form
- Submission state: `useTransition` or `useActionState`
- UI state: `useState` for password visibility, success views
- URL params: `useSearchParams` for tokens

#### Server State
- Session: Managed by Better Auth (via cookies)
- User data: Returned from server actions

### 4.4 Form Field Specifications

#### Sign In Form
| Field | Type | Validation | Placeholder |
|-------|------|------------|-------------|
| Email | email | Required, valid email | "you@example.com" |
| Password | password | Required, min 8 chars | "••••••••" |

#### Sign Up Form
| Field | Type | Validation | Placeholder |
|-------|------|------------|-------------|
| Name | text | Required, 1-100 chars | "John Doe" |
| Email | email | Required, valid email | "you@example.com" |
| Password | password | Required, min 8 chars | "••••••••" |

#### Forgot Password Form
| Field | Type | Validation | Placeholder |
|-------|------|------------|-------------|
| Email | email | Required, valid email | "you@example.com" |

#### Reset Password Form
| Field | Type | Validation | Placeholder |
|-------|------|------------|-------------|
| New Password | password | Required, min 8 chars | "••••••••" |
| Confirm Password | password | Must match new password | "••••••••" |

---

## 5. Design Specifications

### 5.1 Visual Design

#### Card Layout
- Max width: `420px` (mobile: full width with padding)
- Padding: `24px` (mobile), `32px` (tablet+)
- Background: `--card` token
- Border radius: `var(--radius)` (12px default)
- Shadow: Subtle `shadow-lg`

#### Typography
- Title: `text-2xl font-semibold` (mobile), `text-3xl` (desktop)
- Description: `text-sm text-muted-foreground`
- Labels: `text-sm font-medium`
- Errors: `text-sm text-destructive`

#### Colors
- Primary: `--primary` (brand color)
- Background: `--background` with subtle pattern
- Error: `--destructive`
- Success: `--brand` (green accent)

#### Spacing
- Form field gap: `16px`
- Button top margin: `24px`
- Link spacing: `16px` between elements

### 5.2 Responsive Breakpoints

```css
/* Mobile First Approach */
.auth-card {
  @apply w-full max-w-[420px] px-4 py-6;
}

@media (min-width: 640px) {
  .auth-card {
    @apply px-8 py-8;
  }
}

@media (min-width: 768px) {
  .auth-card {
    @apply shadow-lg;
  }
}
```

### 5.3 Animation & Micro-interactions

#### Loading States
- Button spinner: `animate-spin` on `Loader2` icon
- Duration: 750ms per rotation

#### Focus States
- Input focus: `ring-2 ring-ring ring-offset-2`
- Transition: `transition-all duration-200`

#### Success States
- Icon: Scale from 0.8 to 1 with fade in
- Duration: 300ms
- Easing: `ease-out`

---

## 6. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Sign In | `/sign-in` | Form renders, validates, submits to action, redirects on success, shows errors |
| Sign Up | `/sign-up` | Form renders, validates, shows success state, links to sign-in |
| Forgot Password | `/forgot-password` | Form renders, shows security-aware success message |
| Reset Password | `/reset-password?token=xxx` | Reads token, validates, shows success/error states |
| Verify Email | `/verify-email?token=xxx` | Auto-verifies, shows loading/success/error |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Validation | Empty fields show inline errors |
| Validation | Invalid email format shows error |
| Validation | Password < 8 chars shows error |
| Submission | Button disables and shows spinner |
| Error Handling | Server errors show in toast |
| Success | Redirects or shows success UI |
| Security | No email enumeration on forgot password |
| Accessibility | All forms keyboard-navigable |
| Mobile | Works on 320px width screens |

### Integration Criteria

| Component | Integration |
|-----------|-------------|
| All Forms | React Hook Form + Zod resolver |
| All Forms | Call correct server action |
| All Forms | Use `useTransition` for loading |
| Toast | Sonner with theme support |
| Redirects | `useRouter` from next/navigation |
| Session | Better Auth client hooks |

---

## 7. Testing Strategy

### Manual Testing Checklist

#### Sign In Flow
- [ ] Submit with empty fields → validation errors
- [ ] Submit with invalid email format → validation error
- [ ] Submit with wrong password → toast error
- [ ] Submit with valid credentials → redirect to dashboard
- [ ] Click "Forgot password?" → navigate to /forgot-password
- [ ] Click "Sign up" → navigate to /sign-up

#### Sign Up Flow
- [ ] Submit with empty fields → validation errors
- [ ] Submit with existing email → appropriate error
- [ ] Submit with valid data → success card shown
- [ ] Success card shows entered email
- [ ] Click "Resend email" → resend action called
- [ ] Click "Sign in" → navigate to /sign-in

#### Forgot Password Flow
- [ ] Submit with invalid email → validation error
- [ ] Submit with valid email → success message
- [ ] Success message doesn't reveal if email exists
- [ ] Click "Back to Sign In" → navigate to /sign-in

#### Reset Password Flow
- [ ] Visit without token → error state
- [ ] Submit with mismatched passwords → validation error
- [ ] Submit with weak password → validation error
- [ ] Submit with expired token → error with link to retry
- [ ] Submit with valid token → success card
- [ ] Success card has CTA to sign in

#### Verify Email Flow
- [ ] Visit without token → error state
- [ ] Visit with valid token → auto-verifies, shows success
- [ ] Visit with expired token → error with resend option
- [ ] Resend form works and shows confirmation

#### Cross-Cutting
- [ ] All pages work in light mode
- [ ] All pages work in dark mode
- [ ] All pages responsive (test 320px, 768px, 1024px)
- [ ] All pages keyboard accessible
- [ ] Authenticated user redirected from all auth pages

---

## 8. Implementation Notes

### Dependencies Already Installed
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod resolver for RHF
- `zod` - Schema validation
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@radix-ui/react-slot` - Button composition

### Required Imports Pattern

```typescript
// Form imports
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";
import { signInAction } from "@/lib/actions/auth";

// UI imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
```

### Server Action Response Pattern

```typescript
// All actions return this shape:
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage in component:
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  const result = await signInAction(data);
  if (result.success) {
    toast.success("Signed in successfully");
    router.push("/dashboard");
  } else {
    toast.error(result.error || "Something went wrong");
  }
});
```

### Already Authenticated Check

```typescript
// In page.tsx (Server Component)
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
  return <SignInForm />;
}
```

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token exposure in URL | High | Tokens are single-use; still implement auto-cleanup |
| Brute force on auth | Medium | Rate limiting handled by Better Auth |
| Form state loss on error | Low | RHF preserves state; clear on success only |
| Mobile keyboard issues | Low | Test on real devices; use proper input types |
| Theme flash | Low | Use CSS variables; avoid JS theme detection in forms |

---

## 10. Related Documentation

- **PRD.md** - Product requirements and context
- **coding-standards.md** - TypeScript, React, Tailwind conventions
- **ai-interaction.md** - Workflow for implementation
- **lib/validation/auth.ts** - Zod schemas (already implemented)
- **lib/actions/auth.ts** - Server actions (already implemented)
- **lib/auth/session.ts** - Session utilities

---

## 11. Definition of Done

- [ ] All 5 auth pages implemented with full UI
- [ ] All 3 success states implemented
- [ ] All forms use React Hook Form + Zod
- [ ] All loading states functional
- [ ] All error states functional
- [ ] Responsive design verified on mobile/tablet/desktop
- [ ] Dark mode works correctly
- [ ] Accessibility audit passed (keyboard nav, labels, focus)
- [ ] Build passes (`npm run build`)
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P2-F1-auth-pages-ui`
3. Implement components in order: AuthCard → Forms → Success states → Pages
4. Test each page thoroughly
5. Build and commit
