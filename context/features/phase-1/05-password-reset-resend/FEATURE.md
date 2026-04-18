# Feature: Password Reset, Forgot Password & Resend Integration

**Phase:** 1 — Foundation  
**Feature ID:** P1-F5  
**Status:** Ready for Implementation  
**Priority:** High (required for production auth flows — forgot password, reset password, change password, email verification)

---

## 1) Overview

This feature implements the password reset flow, forgot password flow, change password flow, and email verification flow using Better Auth, with **Resend** as the transactional email service. It builds on the Better Auth core setup from P1-F4 and wires up actual email delivery instead of console-only placeholders.

---

## 2) Scope

### In Scope
- Check the latest docs of Better Auth (email/password, email concepts) and Resend using the Context7 MCP
- Install Resend and React Email dependencies
- Configure Resend client in `lib/email/resend.ts`
- Create React Email templates for password reset and email verification
- Wire Better Auth `sendResetPassword` callback to Resend
- Wire Better Auth `sendVerificationEmail` callback to Resend
- Export `forgetPassword`, `resetPassword`, `changePassword` from auth client
- Update `lib/auth/auth.ts` with email callbacks
- Configure development fallback (console logging when `RESEND_API_KEY` is absent)
- Add environment variables (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)

### Out of Scope
- Auth page UI components (covered in Phase 2)
- OAuth providers (future scope)
- Email templates beyond password reset and email verification
- Rate limiting on auth endpoints (post-MVP)

---

## 3) User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | User | Request a password reset via email | I can recover access if I forget my password |
| US-2 | User | Reset my password using a tokenized link | I can regain access to my account |
| US-3 | User | Change my password while logged in | I can keep my account secure |
| US-4 | User | Verify my email address | My account is confirmed |
| US-5 | Developer | Have Resend configured for transactional emails | Auth emails are delivered reliably |

---

## 4) Technical Requirements

### 4.1 Dependencies

```bash
npm install resend @react-email/components @react-email/render
```

### 4.2 Resend Client Configuration

Create `lib/email/resend.ts`:

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@localhost";

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[DEV] Email not sent — RESEND_API_KEY not configured");
    console.log(`[DEV] To: ${options.to}`);
    console.log(`[DEV] Subject: ${options.subject}`);
    return { id: "dev-mode" };
  }

  const { render } = await import("@react-email/render");
  const html = await render(options.react);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html,
  });
}
```

### 4.3 Email Templates

Create `lib/email/templates/password-reset.tsx`:

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your TaskFlow password</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Section>
            <Text>Hi,</Text>
            <Text>
              We received a request to reset your password. Click the button
              below to choose a new one:
            </Text>
            <Button href={resetUrl}>Reset Password</Button>
            <Text>
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>
            <Text>
              This link will expire after a limited time for security.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

Create `lib/email/templates/email-verification.tsx`:

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  verificationUrl: string;
}

export function EmailVerificationEmail({
  verificationUrl,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for TaskFlow</Preview>
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Section>
            <Text>Welcome to TaskFlow!</Text>
            <Text>
              Please verify your email address by clicking the button below:
            </Text>
            <Button href={verificationUrl}>Verify Email</Button>
            <Text>
              If you didn&apos;t create an account, you can safely ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### 4.4 Update Better Auth Server — Wire Email Callbacks

Update `lib/auth/auth.ts` (add email callbacks):

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { PasswordResetEmail } from "@/lib/email/templates/password-reset";
import { EmailVerificationEmail } from "@/lib/email/templates/email-verification";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your TaskFlow password",
        react: PasswordResetEmail({ resetUrl: url }),
      });
    },
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email for TaskFlow",
        react: EmailVerificationEmail({ verificationUrl: url }),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    nextCookies(),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
  ],
});
```

### 4.5 Update Auth Client — Export Password Methods

Update `lib/auth/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  changePassword,
} = authClient;
```

### 4.6 Environment Variables

Add to `.env.example`:

```env
# Resend (Email Service)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## 5) Auth Flows

### Forgot Password Flow
1. User submits email on `/forgot-password` page
2. Client calls `forgetPassword({ email, redirectTo: "/reset-password" })`
3. Better Auth creates a reset token and calls `sendResetPassword`
4. Resend sends password reset email with link to `/reset-password?token=...`
5. In dev mode (no `RESEND_API_KEY`), reset URL is logged to console

### Reset Password Flow
1. User clicks reset link from email → navigates to `/reset-password?token=...`
2. UI reads token from query params
3. User submits new password
4. Client calls `resetPassword({ newPassword, token })`
5. Better Auth validates token and updates password
6. User is redirected to `/sign-in` with success message

### Change Password Flow
1. Authenticated user navigates to settings/security
2. User submits current password + new password
3. Client calls `changePassword({ currentPassword, newPassword })`
4. Better Auth validates current password and updates
5. User is shown success message

### Email Verification Flow
1. After sign-up (when enabled), verification email is sent via Resend
2. User clicks link → navigates to verification endpoint
3. Better Auth verifies token, sets `emailVerified` to true
4. User is redirected to dashboard

---

## 6) Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1 | Resend client configured | `lib/email/resend.ts` exports working instance |
| AC-2 | Password reset email template created | Template renders valid HTML |
| AC-3 | Email verification template created | Template renders valid HTML |
| AC-4 | Better Auth `sendResetPassword` wired to Resend | Reset email sent via Resend (or logged in dev) |
| AC-5 | Better Auth `sendVerificationEmail` wired to Resend | Verification email sent via Resend (or logged in dev) |
| AC-6 | `forgetPassword` exported from auth client | Client can request password reset |
| AC-7 | `resetPassword` exported from auth client | Client can complete password reset |
| AC-8 | `changePassword` exported from auth client | Client can change password while logged in |
| AC-9 | Dev fallback works | Without `RESEND_API_KEY`, emails logged to console |
| AC-10 | Environment variables documented | `.env.example` has `RESEND_API_KEY` and `RESEND_FROM_EMAIL` |

---

## 7) File Checklist

### Must Create
- [ ] `lib/email/resend.ts` — Resend client and `sendEmail` helper
- [ ] `lib/email/templates/password-reset.tsx` — Password reset email template
- [ ] `lib/email/templates/email-verification.tsx` — Email verification template

### Must Update
- [ ] `lib/auth/auth.ts` — Add `sendResetPassword` and `sendVerificationEmail` callbacks
- [ ] `lib/auth/auth-client.ts` — Export `forgetPassword`, `resetPassword`, `changePassword`
- [ ] `.env.example` — Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- [ ] `package.json` — Add `resend`, `@react-email/components`, `@react-email/render`

---

## 8) Version-Sensitive Checklist

| Check | Requirement | Status |
|-------|-------------|--------|
| V-1 | Use `resend` npm package (current SDK) | ☐ |
| V-2 | Use `@react-email/components` for templates | ☐ |
| V-3 | Use `@react-email/render` for HTML rendering | ☐ |
| V-4 | Better Auth `sendResetPassword` callback signature matches current API | ☐ |
| V-5 | Better Auth `sendVerificationEmail` callback signature matches current API | ☐ |
| V-6 | `forgetPassword` client method accepts `redirectTo` param | ☐ |
| V-7 | Dev fallback does not crash when `RESEND_API_KEY` is absent | ☐ |

---

## 9) Dependencies

This feature requires:
- **P1-F1:** Project Initialization (complete)
- **P1-F2:** Neon + Drizzle Setup (complete)
- **P1-F3:** Schema Generation & Migration (complete)
- **P1-F4:** Better Auth Core Setup (must be complete)

This feature blocks:
- **P2-F1:** Auth Pages UI (forgot-password and reset-password pages need these flows)

---

## 10) Testing Checklist

### Manual Testing

```bash
npm run dev

# Test forgot password (without RESEND_API_KEY — check console)
POST http://localhost:3000/api/auth/forget-password
Body: { "email": "test@example.com", "redirectTo": "/reset-password" }

# Test reset password (use token from console log)
POST http://localhost:3000/api/auth/reset-password
Body: { "newPassword": "newpass123", "token": "<token-from-email>" }

# Test change password (authenticated)
POST http://localhost:3000/api/auth/change-password
Body: { "currentPassword": "oldpass123", "newPassword": "newpass456" }
```

### Integration Testing (After P2-F1)

1. Navigate to `/forgot-password`
2. Submit email
3. Check console for reset URL (dev mode)
4. Open reset URL → `/reset-password?token=...`
5. Submit new password
6. Verify redirect to sign-in
7. Sign in with new password
8. Navigate to settings → change password
9. Submit current + new password
10. Verify password was changed

### Resend Testing (With API Key)

1. Set `RESEND_API_KEY` in `.env.local`
2. Set `RESEND_FROM_EMAIL` to a verified sender
3. Request password reset
4. Verify email arrives in inbox
5. Click reset link and complete flow

---

## 11) Commands Reference

```bash
npm install resend @react-email/components @react-email/render
npm run dev
```

---

## 12) Notes

- `RESEND_API_KEY` must be set for actual email delivery; without it, emails are logged to console
- `RESEND_FROM_EMAIL` must use a domain verified in your Resend account for production
- Email verification is optional for MVP (`requireEmailVerification: false`) but the callback is still wired up
- React Email templates produce clean, responsive HTML that works across email clients
- Consider rate limiting on `/api/auth/forget-password` in production to prevent abuse
- The `sendResetPassword` callback receives `{ user, url }` — the URL contains the reset token and is constructed by Better Auth based on `baseURL` and `redirectTo`

---

*This feature implements email-dependent auth flows. Auth page UI (Phase 2) will provide the user-facing forms for these flows.*
