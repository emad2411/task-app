import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import {
  users,
  sessions,
  accounts,
  verifications,
} from "@/lib/db/schema";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";

/**
 * Better Auth instance with Drizzle adapter.
 *
 * NOTE: Only pass the auth-related tables to the adapter.
 * Do NOT include relations or application tables (tasks, categories,
 * userPreferences) as they can cause "referencedTable" errors during
 * Better Auth internal queries.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendPasswordResetEmail({
        to: user.email,
        userName: user.name || user.email,
        resetUrl: url,
      }).catch((error) => {
        console.error("Failed to send password reset email:", error);
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmail({
        to: user.email,
        userName: user.name || user.email,
        verificationUrl: url,
      }).catch((error) => {
        console.error("Failed to send verification email:", error);
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
  plugins: [nextCookies()],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.BETTER_AUTH_URL!]
});