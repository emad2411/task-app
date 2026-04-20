# Phase 1 - Feature 5: Resend Email Integration

**Feature ID:** P1-F5  
**Phase:** 1 (Foundation)  
**Status:** Not Started  
**Priority:** High  
**Dependencies:** P1-F4 (Better Auth Core Setup) Complete  
**Related Features:** Authentication flows (forgot password, reset password, email verification)

---

## Overview

Integrate Resend as the transactional email service to enable password reset and email verification flows. This feature wires Better Auth's email callbacks to Resend, sending professional HTML emails using React Email templates.

---

## Goals

1. Install and configure Resend email service with React Email templating
2. Create email templates for password reset and email verification
3. Configure Better Auth to send emails via Resend callbacks
4. Enable email verification requirement for new user signups
5. Support development mode (console logging when API key unavailable)

---

## Acceptance Criteria

- [ ] Resend SDK and React Email packages installed
- [ ] `lib/email/resend.ts` exports configured Resend client
- [ ] `lib/email/templates/password-reset.tsx` renders professional reset email
- [ ] `lib/email/templates/email-verification.tsx` renders professional verification email
- [ ] Better Auth `sendResetPassword` callback sends email via Resend
- [ ] Better Auth `sendVerificationEmail` callback sends email via Resend
- [ ] `requireEmailVerification` enabled in auth config
- [ ] Development mode logs emails to console instead of sending
- [ ] All password reset and email verification flows work end-to-end
- [ ] Emails include proper branding and actionable CTAs

---

## Technical Context

### Current State
- Better Auth is configured in `lib/auth/auth.ts`
- Auth actions exist in `lib/actions/auth.ts` (forgotPasswordAction, resetPasswordAction, verifyEmailAction)
- Environment variables `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are defined in `.env.local`
- Currently `requireEmailVerification: false` in auth config
- No email infrastructure exists yet

### Required Dependencies
```json
{
  "resend": "^3.x",
  "@react-email/components": "^0.x",
  "react-email": "^2.x"
}
```

### Better Auth Integration Points
Per Context7 docs, Better Auth requires these email callbacks:

**Password Reset:**
```typescript
emailAndPassword: {
  sendResetPassword: async ({ user, url, token }, request) => {
    // Send email with reset link
    // WARNING: Do NOT await email sending to prevent timing attacks
    void sendEmail({...})
  }
}
```

**Email Verification:**
```typescript
emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  expiresIn: 3600, // 1 hour
  sendVerificationEmail: async ({ user, url, token }, request) => {
    // Send email with verification link
    // WARNING: Do NOT await email sending to prevent timing attacks
    void sendEmail({...})
  },
}
```

**Important:** Both callbacks receive:
- First param: `{ user, url, token }` where `url` is the full verification/reset URL
- Second param: `request` - the incoming request object
- Do NOT await email sending (use `void` to fire-and-forget)
- On serverless platforms, use `waitUntil` to ensure delivery

### Resend API Pattern
Per Context7 docs, Resend sends emails via:
```typescript
import { Resend } from 'resend';
import { EmailTemplate } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'TaskFlow <noreply@yourdomain.com>',
  to: ['user@example.com'],
  subject: '...',
  react: EmailTemplate({ firstName: 'John' }), // Pass as function call, NOT JSX
});
```

**Important:** The `react` prop receives a function call like `Component({ props })`, NOT JSX like `<Component {...} />`.

---

## Implementation Details

### File Structure
```
lib/
  email/
    resend.ts              # Resend client configuration
    templates/
      password-reset.tsx   # Password reset email template
      email-verification.tsx # Email verification template
      components/
        email-layout.tsx   # Shared email layout wrapper
        button.tsx         # Email-friendly button component
    index.ts               # Public email exports
```

### Environment Variables
Required (already set in `.env.local`):
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Verified sender address (e.g., `onboarding@resend.dev`)

### Development Mode
When `RESEND_API_KEY` is not set:
- Log email content to console
- Include full HTML preview URL or raw content
- Allow developers to see what would be sent

---

## Tasks

### Task 1: Install Dependencies
```bash
npm install resend @react-email/components react-email
```

### Task 2: Create Email Configuration
**File:** `lib/email/resend.ts`
- Initialize Resend client with API key
- Export `sendEmail` helper function
- Handle development mode (console logging)
- Type-safe email sending interface

### Task 3: Create Email Templates
**File:** `lib/email/templates/components/email-layout.tsx`
- Shared layout wrapper with branding
- Header with TaskFlow logo/name
- Footer with unsubscribe/contact info
- Responsive email-safe HTML structure

**File:** `lib/email/templates/components/button.tsx`
- Email-safe CTA button component
- Accepts `href` and `children` props
- Inline styles for email client compatibility

**File:** `lib/email/templates/password-reset.tsx`
- Props: `{ url: string, userName: string }`
- Headline: "Reset your password"
- Body: Instructions + security notice
- CTA: "Reset Password" button linking to `url`
- Expiry notice (token expires in 1 hour)

**File:** `lib/email/templates/email-verification.tsx`
- Props: `{ url: string, userName: string }`
- Headline: "Verify your email address"
- Body: Welcome message + verification instructions
- CTA: "Verify Email" button linking to `url`
- Alternative: Display URL as text for copy-paste

### Task 4: Update Better Auth Configuration
**File:** `lib/auth/auth.ts`

Add to `emailAndPassword` configuration:
```typescript
sendResetPassword: async ({ user, url, token }, request) => {
  // Fire-and-forget to prevent timing attacks
  void sendPasswordResetEmail({
    to: user.email,
    userName: user.name || user.email,
    resetUrl: url,
  }).catch(error => {
    console.error('Failed to send password reset email:', error);
  });
}
```

Add `emailVerification` configuration:
```typescript
emailVerification: {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  expiresIn: 3600, // 1 hour
  sendVerificationEmail: async ({ user, url, token }, request) => {
    // Fire-and-forget to prevent timing attacks
    void sendVerificationEmail({
      to: user.email,
      userName: user.name || user.email,
      verificationUrl: url,
    }).catch(error => {
      console.error('Failed to send verification email:', error);
    });
  },
}
```

Change `requireEmailVerification: false` → `true`

### Task 5: Create Email Exports
**File:** `lib/email/index.ts`
- Export `sendPasswordResetEmail` function
- Export `sendVerificationEmail` function
- Export email template types

### Task 6: Test Integration
- Test forgot password flow end-to-end
- Test email verification flow end-to-end
- Verify emails render correctly in common clients
- Check development mode console output

---

## Technical Notes

### Security Considerations (Per Context7 Docs)
- **Never await email sending in auth callbacks** - this prevents timing attacks that could reveal whether an email exists
- Use `void` to fire-and-forget: `void sendEmail(...)`
- On serverless platforms (like Next.js/Vercel), use `waitUntil` from `@vercel/functions` to ensure email delivery completes after response
- Tokens are managed by Better Auth; don't generate manually

### React Email Best Practices
- **Pass React component as function call, NOT JSX**: `react: EmailTemplate({ name })` NOT `react: <EmailTemplate name={name} />`
- Use inline styles (CSS-in-JS doesn't work in emails)
- Tables for layout (not flex/grid)
- Test in multiple email clients
- Keep email width ~600px for compatibility

### Better Auth Email Callback Data (Per Context7 Docs)
Both callbacks receive:
- **First param** `{ user, url, token }`:
  - `user`: User object with `email`, `name`, `id`, etc.
  - `url`: Full verification/reset URL with token (ready to send)
  - `token`: The raw token for custom implementations (optional)
- **Second param** `request`: The incoming request object

### Error Handling
- Resend errors should not block auth flow
- Log errors but don't expose to user
- Return generic success message even on email failure (security)

---

## Testing Strategy

### Unit Tests
- Template rendering (snapshot tests)
- Development mode logging
- Email payload structure

### Integration Tests
- Full forgot password flow
- Full email verification flow
- Development mode behavior

### Manual Testing
- Gmail rendering
- Outlook rendering  
- Mobile email clients
- Link click-through

---

## References

- Better Auth Email Docs: https://better-auth.com/docs/concepts/email
- Resend + React Email: https://resend.com/docs/send-with-nextjs
- React Email Docs: https://react.email/docs

---

## Post-Implementation

After this feature is complete:
1. Update `.env.example` with Resend variables
2. Document email template customization
3. Verify all auth flows in staging environment
4. Configure verified domain in Resend dashboard before production

---

## Files to Create/Modify

### New Files
- `lib/email/resend.ts`
- `lib/email/index.ts`
- `lib/email/templates/components/email-layout.tsx`
- `lib/email/templates/components/button.tsx`
- `lib/email/templates/password-reset.tsx`
- `lib/email/templates/email-verification.tsx`

### Modified Files
- `lib/auth/auth.ts` - Add email callbacks, enable verification
- `package.json` - Add dependencies
- `.env.example` - Document Resend variables

---

## Success Criteria

Users can:
1. Request password reset and receive email with working reset link
2. Sign up and receive verification email with working verification link
3. Complete email verification and be automatically signed in
4. Reset password via email link and sign in with new password

Developers can:
1. See logged emails in console during development
2. Customize email templates easily
3. Test flows without real email sending
